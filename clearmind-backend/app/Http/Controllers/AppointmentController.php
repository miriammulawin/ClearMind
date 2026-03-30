<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * GET /admin/appointments
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with([
            'patient:id,firstName,lastName,email,contactNo',
            'doctor:id,firstName,lastName',
        ]);

        if ($date = $request->get('date')) {
            $query->whereDate('appointment_date', $date);
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($doctorId = $request->get('doctor_id')) {
            $query->where('doctor_id', $doctorId);
        }

        $appointments = $query->orderBy('appointment_date')
                              ->orderBy('appointment_time')
                              ->get();

        return response()->json([
            'success' => true,
            'data'    => $appointments->map(fn($a) => $this->formatAppointment($a)),
        ]);
    }

    /**
     * POST /admin/appointments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id'       => 'required|exists:users,id',
            'doctor_id'        => 'nullable|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'type'             => 'required|in:online,physical',
            'reason'           => 'nullable|string|max:500',
            'notes'            => 'nullable|string',
        ]);

        $appointment = Appointment::create([
            ...$validated,
            'status' => Appointment::STATUS_PENDING,
        ]);

        $appointment->load(['patient:id,firstName,lastName', 'doctor:id,firstName,lastName']);

        return response()->json([
            'success' => true,
            'message' => 'Appointment created successfully.',
            'data'    => $this->formatAppointment($appointment),
        ], 201);
    }

    /**
     * GET /admin/appointments/{id}
     */
    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['patient', 'doctor']);

        return response()->json([
            'success' => true,
            'data'    => $this->formatAppointment($appointment),
        ]);
    }

    /**
     * PUT /admin/appointments/{id}
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id'           => 'nullable|exists:users,id',
            'appointment_date'    => 'sometimes|date',
            'appointment_time'    => 'sometimes|date_format:H:i',
            'type'                => 'sometimes|in:online,physical',
            'status'              => 'sometimes|in:pending,confirmed,completed,cancelled,no_show',
            'reason'              => 'nullable|string|max:500',
            'notes'               => 'nullable|string',
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $appointment->update($validated);
        $appointment->load(['patient:id,firstName,lastName', 'doctor:id,firstName,lastName']);

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully.',
            'data'    => $this->formatAppointment($appointment),
        ]);
    }

    /**
     * DELETE /admin/appointments/{id}
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully.',
        ]);
    }

    // ── Helper ──
    private function formatAppointment(Appointment $a): array
    {
        return [
            'id'                  => $a->id,
            'patient_id'          => $a->patient_id,
            'patient'             => $a->patient
                                        ? $a->patient->firstName . ' ' . $a->patient->lastName
                                        : null,
            'patient_email'       => $a->patient?->email,
            'patient_contact'     => $a->patient?->contactNo,
            'doctor_id'           => $a->doctor_id,
            'doctor'              => $a->doctor
                                        ? 'Dr. ' . $a->doctor->firstName . ' ' . $a->doctor->lastName
                                        : 'Unassigned',
            'appointment_date'    => $a->appointment_date?->toDateString(),
            'appointment_time'    => $a->appointment_time,
            'type'                => $a->type,
            'status'              => $a->status,
            'reason'              => $a->reason,
            'notes'               => $a->notes,
            'cancellation_reason' => $a->cancellation_reason,
            'created_at'          => $a->created_at,
            'updated_at'          => $a->updated_at,
        ];
    }
}