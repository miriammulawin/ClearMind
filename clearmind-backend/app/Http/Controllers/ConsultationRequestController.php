<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ConsultationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationRequestController extends Controller
{
    /**
     * GET /admin/consultation-requests
     */
    public function index(Request $request): JsonResponse
    {
        $query = ConsultationRequest::with([
            'patient:id,firstName,lastName,email,contactNo',
            'doctor:id,firstName,lastName',
        ]);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($urgency = $request->get('urgency')) {
            $query->where('urgency', $urgency);
        }

        // Order by urgency priority then newest first
        $requests = $query
            ->orderByRaw("FIELD(urgency, 'emergency', 'high', 'normal', 'low')")
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $requests->map(fn($r) => $this->formatRequest($r)),
        ]);
    }

    /**
     * POST /consultation-requests  (patient submits)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'concern'        => 'required|string|max:500',
            'urgency'        => 'required|in:low,normal,high,emergency',
            'preferred_date' => 'nullable|date|after_or_equal:today',
            'preferred_time' => 'nullable|date_format:H:i',
            'type'           => 'required|in:online,physical,any',
        ]);

        $consultationRequest = ConsultationRequest::create([
            ...$validated,
            'patient_id' => $request->user()->id,
            'status'     => ConsultationRequest::STATUS_PENDING,
        ]);

        $consultationRequest->load('patient:id,firstName,lastName');

        return response()->json([
            'success' => true,
            'message' => 'Consultation request submitted successfully.',
            'data'    => $this->formatRequest($consultationRequest),
        ], 201);
    }

    /**
     * GET /admin/consultation-requests/{id}
     */
    public function show(ConsultationRequest $consultationRequest): JsonResponse
    {
        $consultationRequest->load(['patient', 'doctor', 'appointment']);

        return response()->json([
            'success' => true,
            'data'    => $this->formatRequest($consultationRequest),
        ]);
    }

    /**
     * PUT /admin/consultation-requests/{id}
     * Admin reviews / approves / rejects a request.
     */
    public function update(Request $request, ConsultationRequest $consultationRequest): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id'   => 'nullable|exists:users,id',
            'status'      => 'sometimes|in:pending,reviewed,approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $consultationRequest->update($validated);

        // If approved, auto-create an appointment from the request details
        if (
            isset($validated['status']) &&
            $validated['status'] === ConsultationRequest::STATUS_APPROVED &&
            ! $consultationRequest->appointment_id
        ) {
            $appointment = Appointment::create([
                'patient_id'       => $consultationRequest->patient_id,
                'doctor_id'        => $consultationRequest->doctor_id,
                'appointment_date' => $consultationRequest->preferred_date ?? today()->addDay(),
                'appointment_time' => $consultationRequest->preferred_time ?? '09:00',
                'type'             => $consultationRequest->type === 'any'
                                        ? 'physical'
                                        : $consultationRequest->type,
                'status'           => Appointment::STATUS_CONFIRMED,
                'reason'           => $consultationRequest->concern,
            ]);

            $consultationRequest->update(['appointment_id' => $appointment->id]);
        }

        $consultationRequest->load(['patient:id,firstName,lastName', 'doctor:id,firstName,lastName']);

        return response()->json([
            'success' => true,
            'message' => 'Consultation request updated successfully.',
            'data'    => $this->formatRequest($consultationRequest),
        ]);
    }

    /**
     * DELETE /admin/consultation-requests/{id}
     */
    public function destroy(ConsultationRequest $consultationRequest): JsonResponse
    {
        $consultationRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Consultation request deleted.',
        ]);
    }

    // ── Helper ──
    private function formatRequest(ConsultationRequest $r): array
    {
        return [
            'id'             => $r->id,
            'patient_id'     => $r->patient_id,
            'patient'        => $r->patient
                                    ? $r->patient->firstName . ' ' . $r->patient->lastName
                                    : null,
            'patient_email'  => $r->patient?->email,
            'patient_contact'=> $r->patient?->contactNo,
            'doctor_id'      => $r->doctor_id,
            'doctor'         => $r->doctor
                                    ? 'Dr. ' . $r->doctor->firstName . ' ' . $r->doctor->lastName
                                    : 'Unassigned',
            'concern'        => $r->concern,
            'urgency'        => $r->urgency,
            'preferred_date' => $r->preferred_date?->toDateString(),
            'preferred_time' => $r->preferred_time,
            'type'           => $r->type,
            'status'         => $r->status,
            'admin_notes'    => $r->admin_notes,
            'appointment_id' => $r->appointment_id,
            'created_at'     => $r->created_at->toDateTimeString(),
            'updated_at'     => $r->updated_at->toDateTimeString(),
        ];
    }
}