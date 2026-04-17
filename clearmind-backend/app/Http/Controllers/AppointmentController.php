<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /* ══════════════════════════════════════════════
       GET /appointments
    ══════════════════════════════════════════════ */
    public function index(Request $request): JsonResponse
    {
        try {
            $user  = Auth::user();
            $query = Appointment::with(['patient', 'doctor', 'bookedBy'])
                ->orderByDesc('appointment_date')
                ->orderByDesc('start_time');

            // ── Role-based scoping ──────────────────────────────────────
            if ($user->role === 'Client') {
                // Client sees only their own booked appointments
                $query->where('booked_by_user_id', $user->id);

            } elseif ($user->role === 'Doctor') {
                // Doctor sees ONLY appointments assigned to them
                $query->where('doctor_user_id', $user->id);
            }
            // Admin has no restriction — sees everything

            // ── Optional filters ────────────────────────────────────────
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('date')) {
                $query->whereDate('appointment_date', $request->date);
            }

            return response()->json(['data' => $query->get()]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       POST /appointments
    ══════════════════════════════════════════════ */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            /* Patient */
            'patient_id'               => ['nullable', 'exists:patients,patient_id'],
            'patient_firstName'        => ['required_without:patient_id', 'string', 'max:100'],
            'patient_lastName'         => ['required_without:patient_id', 'string', 'max:100'],
            'patient_middleInitial'    => ['nullable', 'string', 'max:5'],
            'patient_dob'              => ['nullable', 'date'],
            'patient_sex'              => ['nullable', 'in:male,female,other'],
            'patient_civilStatus'      => ['nullable', 'in:single,married,widowed,divorced,separated'],
            'patient_classification'   => ['nullable', 'in:PWD,Senior Citizen,Regular'],
            'patient_contactNo'        => ['nullable', 'string', 'max:20'],
            'patient_email'            => ['nullable', 'email', 'max:191'],
            'patient_address'          => ['nullable', 'string'],

            /* Informant */
            'informant_name'           => ['nullable', 'string', 'max:200'],
            'informant_relation'       => ['nullable', 'string', 'max:100'],

            /* Schedule */
            'appointment_date'         => ['required', 'date', 'after_or_equal:today'],
            'start_time'               => ['required', 'date_format:H:i'],
            'end_time'                 => ['required', 'date_format:H:i', 'after:start_time'],
            'visit_type'               => ['required', 'in:onsite,virtual'],

            /* Service */
            'reason_for_consultation'  => ['nullable', 'string', 'max:500'],
            'service_type'             => ['nullable', 'string', 'max:100'],
            'pae_purpose'              => ['nullable', 'string', 'max:200'],

            /* Payment */
            'payment_status'           => ['nullable', 'in:paid,not_paid,probono'],
            'payment_reference'        => ['nullable', 'string', 'max:100'],

            /* Receipts */
            'receipts'                 => ['nullable', 'array', 'max:10'],
            'receipts.*'               => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            /* Doctor */
            'doctor_user_id'           => ['nullable', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        $receiptPaths = [];

        try {
            $user = Auth::user();

            /* ── 1. Resolve or create patient ── */
            if ($request->filled('patient_id')) {
                $patient = Patient::where('patient_id', $request->patient_id)->firstOrFail();
            } else {
                $isSelfBooking = !$request->filled('informant_name');
                $patient = Patient::create([
                    'user_id'               => ($isSelfBooking && $user->role === 'Client') ? $user->id : null,
                    'firstName'             => $request->patient_firstName,
                    'lastName'              => $request->patient_lastName,
                    'middleInitial'         => $request->patient_middleInitial,
                    'dob'                   => $request->patient_dob,
                    'sex'                   => $request->patient_sex,
                    'civilStatus'           => $request->patient_civilStatus,
                    'patientClassification' => $request->patient_classification ?? 'Regular',
                    'contactNo'             => $request->patient_contactNo,
                    'email'                 => $request->patient_email,
                    'address'               => $request->patient_address,
                ]);
            }

            /* ── 2. Upload receipts ── */
            if ($request->hasFile('receipts')) {
                foreach ($request->file('receipts') as $file) {
                    $receiptPaths[] = $file->store('appointments/receipts', 'public');
                }
            }

            /* ── 3. Create appointment ── */
            $appointment = Appointment::create([
                'booked_by_user_id'       => $user->id,
                'patient_id'              => $patient->patient_id,
                'informant_name'          => $request->informant_name,
                'informant_relation'      => $request->informant_relation,
                'doctor_user_id'          => $request->doctor_user_id,
                'appointment_date'        => $request->appointment_date,
                'start_time'              => $request->start_time,
                'end_time'                => $request->end_time,
                'visit_type'              => $request->visit_type,
                'reason_for_consultation' => $request->reason_for_consultation,
                'service_type'            => $request->service_type,
                'pae_purpose'             => $request->pae_purpose,
                'payment_status'          => $request->payment_status ?? 'not_paid',
                'payment_reference'       => $request->filled('payment_reference')
                                                ? $request->payment_reference
                                                : null,
                'receipt_paths'           => $receiptPaths,
                'status'                  => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Appointment created successfully.',
                'data'    => Appointment::with(['patient', 'doctor', 'bookedBy'])
                                ->find($appointment->appointment_id),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            foreach ($receiptPaths as $path) {
                Storage::disk('public')->delete($path);
            }
            return response()->json([
                'message' => 'Failed to create appointment.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /* ══════════════════════════════════════════════
       GET /appointments/{id}
    ══════════════════════════════════════════════ */
    public function show(int $id): JsonResponse
    {
        try {
            $appt = Appointment::with(['patient', 'doctor', 'bookedBy'])
                ->where('appointment_id', $id)
                ->firstOrFail();

            $user = Auth::user();
            if ($user->role === 'Client' && $appt->booked_by_user_id !== $user->id) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
            // Doctor can only view their own assigned appointments
            if ($user->role === 'Doctor' && $appt->doctor_user_id !== $user->id) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }

            return response()->json(['data' => $appt]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }
    }

    /* ══════════════════════════════════════════════
       PUT /appointments/{id}
    ══════════════════════════════════════════════ */
    public function update(Request $request, int $id): JsonResponse
    {
        $appt = Appointment::where('appointment_id', $id)->first();
        if (!$appt) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'            => ['nullable', 'in:pending,confirmed,completed,cancelled,no_show'],
            'doctor_user_id'    => ['nullable', 'exists:users,id'],
            'payment_status'    => ['nullable', 'in:paid,not_paid,probono'],
            'payment_reference' => ['nullable', 'string', 'max:100'],
            'notes'             => ['nullable', 'string'],
            'service_type'      => ['nullable', 'string', 'max:100'],
            'receipts'          => ['nullable', 'array', 'max:10'],
            'receipts.*'        => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $appt->fill($request->only([
                'status', 'doctor_user_id', 'payment_status', 'payment_reference',
                'notes', 'visit_type', 'appointment_date', 'start_time', 'end_time',
                'service_type',
            ]));

            if ($request->hasFile('receipts')) {
                $existing = $appt->receipt_paths ?? [];
                foreach ($request->file('receipts') as $file) {
                    $existing[] = $file->store('appointments/receipts', 'public');
                }
                $appt->receipt_paths = $existing;
            }

            $appt->save();

            return response()->json([
                'message' => 'Appointment updated.',
                'data'    => Appointment::with(['patient', 'doctor', 'bookedBy'])
                                ->find($appt->appointment_id),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       DELETE /appointments/{id}
    ══════════════════════════════════════════════ */
    public function destroy(int $id): JsonResponse
    {
        $appt = Appointment::where('appointment_id', $id)->first();
        if (!$appt) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        try {
            $appt->delete();
            return response()->json(['message' => 'Appointment cancelled.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}