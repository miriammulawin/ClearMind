<?php
// app/Http/Controllers/DoctorPatientController.php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorPatientController extends Controller
{
    /**
     * GET /doctor/patients
     *
     * Returns the distinct list of patients who have at least one appointment
     * with the currently authenticated doctor, along with their latest
     * appointment details and aggregate stats.
     *
     * Query params:
     *   status        – filter by appointment status  (pending|confirmed|completed|cancelled|no_show)
     *   patient_type  – "new" or "existing"  (existing = more than 1 appointment with this doctor)
     *   search        – partial match on patient firstName / lastName
     *   per_page      – rows per page (default 15)
     *   page          – page number  (default 1)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $doctor = Auth::user();

            // Guard: only doctors may use this endpoint
            if ($doctor->role !== 'Doctor') {
                return response()->json(['message' => 'Forbidden. Doctor access only.'], 403);
            }

            // ── Base query ────────────────────────────────────────────────
            // We join appointments → patients so we can filter and sort in SQL.
            $query = Appointment::query()
                ->with(['patient', 'patient.user'])
                ->where('doctor_user_id', $doctor->id)
                ->whereNull('deleted_at')
                ->whereHas('patient', fn ($q) => $q->where('is_active', true));

            // ── Filters ───────────────────────────────────────────────────
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('search')) {
                $s = $request->search;
                $query->whereHas('patient', function ($q) use ($s) {
                    $q->where('firstName', 'like', "%{$s}%")
                      ->orWhere('lastName',  'like', "%{$s}%")
                      ->orWhere('email',     'like', "%{$s}%")
                      ->orWhere('contactNo', 'like', "%{$s}%");
                });
            }

            // ── Fetch ALL matching appointments first ─────────────────────
            // We need all records to compute per-patient stats accurately
            // before we paginate the *patient* list.
            $allAppointments = $query
                ->orderByDesc('appointment_date')
                ->orderByDesc('start_time')
                ->get();

            // ── Group by patient ──────────────────────────────────────────
            $grouped = $allAppointments->groupBy('patient_id');

            // ── Build patient-centric result rows ─────────────────────────
            $rows = $grouped->map(function ($appointments) {
                $latest  = $appointments->first();   // most recent (sorted desc)
                $patient = $latest->patient;

                // Total visits = number of non-cancelled appointments
                $totalVisits = $appointments->whereNotIn('status', ['cancelled', 'no_show'])->count();

                // Patient type: "existing" when they have more than 1 visit, else "new"
                $patientType = $totalVisits > 1 ? 'Existing Patient' : 'New Patient';

                // Age from dob
                $age = $patient->dob
                    ? \Carbon\Carbon::parse($patient->dob)->age
                    : null;

                // Gender label
                $genderMap = [
                    'male'        => 'Male',
                    'female'      => 'Female',
                    'transgender' => 'Transgender',
                    'trans_woman' => 'Trans Woman',
                    'trans_man'   => 'Trans Man',
                    'non_binary'  => 'Non-binary',
                    'prefer_not'  => 'Prefer not to say',
                ];
                $gender = $genderMap[$patient->genderIdentity ?? $patient->sex] ?? ucfirst($patient->sex ?? '');

                return [
                    'patient_id'      => $patient->patient_id,
                    'name'            => trim("{$patient->firstName} {$patient->lastName}"),
                    'firstName'       => $patient->firstName,
                    'lastName'        => $patient->lastName,
                    'middleInitial'   => $patient->middleInitial,
                    'age'             => $age,
                    'gender'          => $gender,
                    'address'         => $patient->address,
                    'contact'         => $patient->contactNo,
                    'email'           => $patient->email,
                    'patientType'     => $patientType,
                    'totalVisits'     => $totalVisits,
                    // Latest appointment snapshot
                    'latestAppointment' => [
                        'appointment_id'   => $latest->appointment_id,
                        'appointment_ref'  => $latest->appointment_ref,
                        'date'             => \Carbon\Carbon::parse($latest->appointment_date)->format('F d, Y'),
                        'raw_date'         => $latest->appointment_date,
                        'time'             => \Carbon\Carbon::parse($latest->start_time)->format('g:i a'),
                        'visit_type'       => $latest->visit_type,          // onsite | virtual
                        'consultationMode' => $latest->visit_type === 'virtual' ? 'Virtual' : 'On-Site',
                        'status'           => ucfirst($latest->status),
                        'raw_status'       => $latest->status,
                        'type'             => $this->resolveVisitLabel($latest),
                        'payment_status'   => $latest->payment_status,
                        'notes'            => $latest->notes,
                    ],
                    // All appointments (for history / modal)
                    'appointments'    => $appointments->map(fn ($a) => [
                        'appointment_id'   => $a->appointment_id,
                        'appointment_ref'  => $a->appointment_ref,
                        'date'             => \Carbon\Carbon::parse($a->appointment_date)->format('F d, Y'),
                        'raw_date'         => $a->appointment_date,
                        'time'             => \Carbon\Carbon::parse($a->start_time)->format('g:i a'),
                        'visit_type'       => $a->visit_type,
                        'consultationMode' => $a->visit_type === 'virtual' ? 'Virtual' : 'On-Site',
                        'status'           => ucfirst($a->status),
                        'raw_status'       => $a->status,
                        'type'             => $this->resolveVisitLabel($a),
                        'payment_status'   => $a->payment_status,
                        'notes'            => $a->notes,
                    ])->values(),
                ];
            })->values();

            // ── patient_type filter (applied after grouping) ──────────────
            if ($request->filled('patient_type')) {
                $filter = $request->patient_type === 'new' ? 'New Patient' : 'Existing Patient';
                $rows   = $rows->filter(fn ($r) => $r['patientType'] === $filter)->values();
            }

            // ── Pagination ────────────────────────────────────────────────
            $perPage     = (int) $request->input('per_page', 15);
            $page        = (int) $request->input('page', 1);
            $total       = $rows->count();
            $lastPage    = (int) ceil($total / $perPage) ?: 1;
            $pageItems   = $rows->slice(($page - 1) * $perPage, $perPage)->values();

            return response()->json([
                'data' => $pageItems,
                'pagination' => [
                    'total'        => $total,
                    'per_page'     => $perPage,
                    'current_page' => $page,
                    'last_page'    => $lastPage,
                ],
                'doctor' => [
                    'id'   => $doctor->id,
                    'name' => trim("{$doctor->firstName} {$doctor->lastName}"),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch patients.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /doctor/patients/{patientId}
     *
     * Returns full profile of a single patient + all their appointments
     * with the currently authenticated doctor.
     */
    public function show(int $patientId): JsonResponse
    {
        try {
            $doctor = Auth::user();

            if ($doctor->role !== 'Doctor') {
                return response()->json(['message' => 'Forbidden.'], 403);
            }

            // Confirm this patient belongs to (has an appt with) this doctor
            $hasAppointment = Appointment::where('doctor_user_id', $doctor->id)
                ->where('patient_id', $patientId)
                ->whereNull('deleted_at')
                ->exists();

            if (!$hasAppointment) {
                return response()->json(['message' => 'Patient not found under your care.'], 404);
            }

            $appointments = Appointment::with(['patient', 'patient.user'])
                ->where('doctor_user_id', $doctor->id)
                ->where('patient_id', $patientId)
                ->whereNull('deleted_at')
                ->orderByDesc('appointment_date')
                ->get();

            $patient     = $appointments->first()->patient;
            $totalVisits = $appointments->whereNotIn('raw_status', ['cancelled', 'no_show'])->count();

            $age = $patient->dob
                ? \Carbon\Carbon::parse($patient->dob)->age
                : null;

            return response()->json([
                'data' => [
                    'patient_id'    => $patient->patient_id,
                    'name'          => trim("{$patient->firstName} {$patient->lastName}"),
                    'firstName'     => $patient->firstName,
                    'lastName'      => $patient->lastName,
                    'middleInitial' => $patient->middleInitial,
                    'dob'           => $patient->dob,
                    'age'           => $age,
                    'sex'           => $patient->sex,
                    'genderIdentity'=> $patient->genderIdentity,
                    'civilStatus'   => $patient->civilStatus,
                    'classification'=> $patient->patientClassification,
                    'address'       => $patient->address,
                    'contact'       => $patient->contactNo,
                    'email'         => $patient->email,
                    'patientType'   => $totalVisits > 1 ? 'Existing Patient' : 'New Patient',
                    'totalVisits'   => $totalVisits,
                    'appointments'  => $appointments->map(fn ($a) => [
                        'appointment_id'  => $a->appointment_id,
                        'appointment_ref' => $a->appointment_ref,
                        'date'            => \Carbon\Carbon::parse($a->appointment_date)->format('F d, Y'),
                        'raw_date'        => $a->appointment_date,
                        'time'            => \Carbon\Carbon::parse($a->start_time)->format('g:i a'),
                        'consultationMode'=> $a->visit_type === 'virtual' ? 'Virtual' : 'On-Site',
                        'status'          => ucfirst($a->status),
                        'raw_status'      => $a->status,
                        'type'            => $this->resolveVisitLabel($a),
                        'payment_status'  => $a->payment_status,
                        'notes'           => $a->notes,
                    ])->values(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /**
     * Derive a human-readable visit label from reason / service type.
     */
    private function resolveVisitLabel(Appointment $appt): string
    {
        $reason = strtolower($appt->reason_for_consultation ?? '');

        if (str_contains($reason, 'follow')) {
            return 'Follow Up';
        }
        if (str_contains($reason, 'check')) {
            return 'Check Up';
        }
        if (str_contains($reason, 'new') || str_contains($reason, 'concern')) {
            return 'New Concern';
        }

        return ucwords($appt->service_type ?? 'Consultation');
    }
}