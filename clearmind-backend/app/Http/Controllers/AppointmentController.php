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

            if ($user->role === 'Client') {
                $query->where('booked_by_user_id', $user->id);
            } elseif ($user->role === 'Doctor') {
                $query->where('doctor_user_id', $user->id);
            }

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
       GET /appointments/booked-slots
       Returns all confirmed time slots for a doctor
       on a specific date so the frontend can block
       them out in the time picker.

       Query params:
         doctor_user_id  — required
         date            — required (YYYY-MM-DD)
    ══════════════════════════════════════════════ */
    public function bookedSlots(Request $request): JsonResponse
    {
        $request->validate([
            'doctor_user_id' => ['required', 'integer', 'exists:users,id'],
            'date'           => ['required', 'date'],
        ]);

        // Only confirmed appointments block the slot.
        // pending / cancelled / no_show do NOT block.
        $slots = Appointment::where('doctor_user_id', $request->doctor_user_id)
            ->whereDate('appointment_date', $request->date)
            ->whereIn('status', ['confirmed', 'completed'])
            ->get(['appointment_id', 'start_time', 'end_time', 'status']);

        return response()->json([
            'data' => $slots->map(fn($s) => [
                'appointment_id' => $s->appointment_id,
                'start_time'     => substr($s->start_time, 0, 5), // HH:MM
                'end_time'       => substr($s->end_time,   0, 5),
                'status'         => $s->status,
            ]),
        ]);
    }

    /* ══════════════════════════════════════════════
       POST /appointments
    ══════════════════════════════════════════════ */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
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
            'informant_name'           => ['nullable', 'string', 'max:200'],
            'informant_relation'       => ['nullable', 'string', 'max:100'],
            'appointment_date'         => ['required', 'date', 'after_or_equal:today'],
            'start_time'               => ['required', 'date_format:H:i'],
            'end_time'                 => ['required', 'date_format:H:i', 'after:start_time'],
            'visit_type'               => ['required', 'in:onsite,virtual'],
            'reason_for_consultation'  => ['nullable', 'string', 'max:500'],
            'service_type'             => ['nullable', 'string', 'max:100'],
            'pae_purpose'              => ['nullable', 'string', 'max:200'],
            'payment_status'           => ['nullable', 'in:paid,not_paid,probono'],
            'payment_reference'        => ['nullable', 'string', 'max:100'],
            'bill_amount'              => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'receipts'                 => ['nullable', 'array', 'max:10'],
            'receipts.*'               => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'doctor_user_id'           => ['nullable', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        /* ── Time-slot conflict check ────────────────────────────────
           If a doctor is assigned, make sure the requested time window
           does not overlap any existing CONFIRMED appointment for that
           doctor on the same date.

           Overlap condition (Allen's interval algebra):
             existing.start_time < new.end_time
             AND existing.end_time > new.start_time
        ─────────────────────────────────────────────────────────── */
        if ($request->filled('doctor_user_id')) {
            $conflict = Appointment::where('doctor_user_id', $request->doctor_user_id)
                ->whereDate('appointment_date', $request->appointment_date)
                ->whereIn('status', ['confirmed', 'completed'])
                ->where('start_time', '<', $request->end_time)
                ->where('end_time',   '>', $request->start_time)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'The selected time slot is already taken. Please choose a different time.',
                    'errors'  => [
                        'start_time' => ['This time slot overlaps with an existing confirmed appointment.'],
                    ],
                ], 422);
            }
        }

        DB::beginTransaction();
        $receiptPaths = [];

        try {
            $user = Auth::user();

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

            if ($request->hasFile('receipts')) {
                foreach ($request->file('receipts') as $file) {
                    $receiptPaths[] = $file->store('appointments/receipts', 'public');
                }
            }

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
                'bill_amount'             => $request->filled('bill_amount')
                                                ? $request->bill_amount
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
            'bill_amount'       => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
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
                'bill_amount', 'notes', 'visit_type', 'appointment_date',
                'start_time', 'end_time', 'service_type',
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