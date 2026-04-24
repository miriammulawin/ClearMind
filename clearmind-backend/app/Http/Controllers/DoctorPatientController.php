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
     * GET /api/doctor/patients
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $doctor = Auth::user();

            if ($doctor->role !== 'Doctor') {
                return response()->json(['message' => 'Forbidden. Doctor access only.'], 403);
            }

            $query = Appointment::query()
                ->with(['patient', 'patient.user'])
                ->where('doctor_user_id', $doctor->id)
                ->whereNull('deleted_at')
                ->whereHas('patient', fn ($q) => $q->where('is_active', true));

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

            $allAppointments = $query
                ->orderByDesc('appointment_date')
                ->orderByDesc('start_time')
                ->get();

            $grouped = $allAppointments->groupBy('patient_id');

            $rows = $grouped->map(function ($appointments) {
                $latest  = $appointments->first();
                $patient = $latest->patient;

                $totalVisits = $appointments->whereNotIn('status', ['cancelled', 'no_show'])->count();
                $patientType = $totalVisits > 1 ? 'Existing Patient' : 'New Patient';

                $age = $patient->dob
                    ? \Carbon\Carbon::parse($patient->dob)->age
                    : null;

                $latestAppointment = $patient->appointments()
                    ->orderByDesc('appointment_date')
                    ->orderByDesc('start_time')
                    ->first();

                $genderMap = [
                    'male'        => 'Male',
                    'female'      => 'Female',
                    'transgender' => 'Transgender',
                    'trans_woman' => 'Trans Woman',
                    'trans_man'   => 'Trans Man',
                    'non_binary'  => 'Non-binary',
                    'prefer_not'  => 'Prefer not to say',
                ];
                $gender = $genderMap[$patient->genderIdentity ?? $patient->sex]
                    ?? ucfirst($patient->sex ?? '');

                return [
                    'patient_id'    => $patient->patient_id,
                    'name'          => trim("{$patient->firstName} {$patient->lastName}"),
                    'firstName'     => $patient->firstName,
                    'lastName'      => $patient->lastName,
                    'middleInitial' => $patient->middleInitial,
                    'age'           => $age,
                    'gender'        => $gender,
                    'address'       => $patient->address,
                    'contact'       => $patient->contactNo,
                    'email'         => $patient->email,
                    'patientType'   => $patientType,
                    'totalVisits'   => $totalVisits,

                    'latestAppointment' => $this->formatAppointment($latestAppointment),
                    'appointments' => $appointments
                        ->map(fn ($a) => $this->formatAppointment($a))
                        ->values(),
                ];
            })->values();

            if ($request->filled('patient_type')) {
                $filter = $request->patient_type === 'new' ? 'New Patient' : 'Existing Patient';
                $rows   = $rows->filter(fn ($r) => $r['patientType'] === $filter)->values();
            }

            $perPage   = (int) $request->input('per_page', 15);
            $page      = (int) $request->input('page', 1);
            $total     = $rows->count();
            $lastPage  = (int) ceil($total / $perPage) ?: 1;
            $pageItems = $rows->slice(($page - 1) * $perPage, $perPage)->values();

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
     * GET /api/doctor/patients/{patientId}
     */
    public function show(int $patientId): JsonResponse
    {
        try {
            $doctor = Auth::user();

            if ($doctor->role !== 'Doctor') {
                return response()->json(['message' => 'Forbidden.'], 403);
            }

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
                ->orderByDesc('start_time')
                ->get();

            $patient = $appointments->first()->patient;

            $totalVisits = $appointments
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->count();

            $age = $patient->dob
                ? \Carbon\Carbon::parse($patient->dob)->age
                : null;

            return response()->json([
                'data' => [
                    'patient_id'     => $patient->patient_id,
                    'name'           => trim("{$patient->firstName} {$patient->lastName}"),
                    'firstName'      => $patient->firstName,
                    'lastName'       => $patient->lastName,
                    'middleInitial'  => $patient->middleInitial,
                    'dob'            => $patient->dob
                        ? \Carbon\Carbon::parse($patient->dob)->format('F d, Y')
                        : null,
                    'age'            => $age,
                    'sex'            => $patient->sex,
                    'genderIdentity' => $patient->genderIdentity,
                    'civilStatus'    => $patient->civilStatus,
                    'classification' => $patient->patientClassification,
                    'address'        => $patient->address,
                    'contact'        => $patient->contactNo,
                    'email'          => $patient->email,
                    'patientType'    => $totalVisits > 1 ? 'Existing Patient' : 'New Patient',
                    'totalVisits'    => $totalVisits,

                    'appointments' => $appointments
                        ->map(fn ($a) => $this->formatAppointment($a))
                        ->values(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Clinical Notes
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/appointments/{id}/clinical-notes
     */
    public function getClinicalNotes($id): JsonResponse
    {
       $appointment = Appointment::where('appointment_id', $id)->firstOrFail();

        return response()->json([
            'notes' => json_decode($appointment->clinical_notes, true) ?? [
                'intake'         => [],
                'progress'       => [],
                'recommendation' => [],
            ],
        ]);
    }

    /**
     * POST /api/appointments/{id}/clinical-notes
     *
     * Body: { type: "intake"|"progress"|"recommendation", content: "..." }
     */
    public function storeClinicalNote(Request $request, $id): JsonResponse
    {
        $request->validate([
            'type'    => 'required|in:intake,progress,recommendation',
            'content' => 'required|string',
        ]);

        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();
        $doctor      = Auth::user();
        $authorName  = 'Dr. ' . trim("{$doctor->firstName} {$doctor->lastName}");

        $notes = json_decode($appointment->clinical_notes, true) ?? [
            'intake'         => [],
            'progress'       => [],
            'recommendation' => [],
        ];

        $newNote = [
            'id'      => (string) \Illuminate\Support\Str::uuid(),
            'date'    => now()->format('F d, Y'),
            'author'  => $authorName,
            'content' => $request->content,
        ];

        // Prepend so newest is first
        array_unshift($notes[$request->type], $newNote);

        $appointment->clinical_notes = json_encode($notes);
        $appointment->save();

        return response()->json([
            'message' => 'Saved successfully',
            'note'    => $newNote,
        ]);
    }

    /**
     * PUT /api/appointments/{id}/clinical-notes/{noteId}
     *
     * Body: { type: "intake"|"progress"|"recommendation", content: "..." }
     */
    public function updateClinicalNote(Request $request, $id, $noteId): JsonResponse
    {
        $request->validate([
            'type'    => 'required|in:intake,progress,recommendation',
            'content' => 'required|string',
        ]);

        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();

        $notes = json_decode($appointment->clinical_notes, true) ?? [
            'intake'         => [],
            'progress'       => [],
            'recommendation' => [],
        ];

        $type  = $request->type;
        $found = false;

        $notes[$type] = array_map(function ($note) use ($noteId, $request, &$found) {
            if ((string)($note['id'] ?? '') === (string)$noteId) {
                $found = true;
                return array_merge($note, [
                    'content'    => $request->content,
                    'updated_at' => now()->format('F d, Y'),
                ]);
            }
            return $note;
        }, $notes[$type]);

        if (!$found) {
            return response()->json(['message' => 'Note not found.'], 404);
        }

        $appointment->clinical_notes = json_encode($notes);
        $appointment->save();

        return response()->json(['message' => 'Updated successfully']);
    }

    /**
     * DELETE /api/appointments/{id}/clinical-notes/{noteId}
     *
     * Body: { type: "intake"|"progress"|"recommendation" }
     */
    public function deleteClinicalNote(Request $request, $id, $noteId): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:intake,progress,recommendation',
        ]);

        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();

        $notes = json_decode($appointment->clinical_notes, true) ?? [
            'intake'         => [],
            'progress'       => [],
            'recommendation' => [],
        ];

        $type           = $request->type;
        $before         = count($notes[$type]);
        $notes[$type]   = array_values(
            array_filter($notes[$type], fn ($n) => (string)($n['id'] ?? '') !== (string)$noteId)
        );

        if (count($notes[$type]) === $before) {
            return response()->json(['message' => 'Note not found.'], 404);
        }

        $appointment->clinical_notes = json_encode($notes);
        $appointment->save();

        return response()->json(['message' => 'Deleted successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Progression Note
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/appointments/{id}/progression-note
     *
     * Body: { assessment: "..." }
     */
    public function saveProgressionNote(Request $request, $id): JsonResponse
    {
        try {
            $doctor = Auth::user();

            if ($doctor->role !== 'Doctor') {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $request->validate([
                'assessment' => 'required|string',
            ]);

            $appointment = Appointment::where('appointment_id', $id)
                ->where('doctor_user_id', $doctor->id)
                ->firstOrFail();

            $appointment->progression_note = [
                'assessment' => $request->assessment,
                'updated_at' => now()->toDateTimeString(),
                'doctor_id'  => $doctor->id,
            ];

            $appointment->save();

            return response()->json([
                'message' => 'Progression note saved successfully',
  'data'    => $appointment->progression_note,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to save progression note',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function formatAppointment(Appointment $a): array
    {
        // Decode progression note if stored as JSON string
$progressionNote = $a->progression_note ?? null;
        return [
            'appointment_id'          => $a->appointment_id,
            'appointment_ref'         => $a->appointment_ref,
            'date'                    => \Carbon\Carbon::parse($a->appointment_date)->format('F d, Y'),
            'raw_date'                => $a->appointment_date,
            'time'                    => \Carbon\Carbon::parse($a->start_time)->format('g:i a'),
            'end_time'                => $a->end_time
                ? \Carbon\Carbon::parse($a->end_time)->format('g:i a')
                : null,
            'visit_type'              => $a->visit_type,
            'consultationMode'        => $a->visit_type === 'virtual' ? 'Virtual' : 'On-Site',
            'status'                  => ucwords(str_replace('_', ' ', $a->status)),
            'raw_status'              => $a->status,
            'type'                    => $this->resolveVisitLabel($a),
            'service_type'            => $a->service_type,
            'pae_purpose'             => $a->pae_purpose,
            'payment_status'          => $a->payment_status,
            'payment_reference'       => $a->payment_reference,
            'notes'                   => $a->notes,
            'reason_for_consultation' => $a->reason_for_consultation,
            'progression_note'        => $progressionNote,
            

            // Receipt images — always return as arrays so frontend can use [0]
            'receipt_urls'            => $a->receipt_urls ?? [],
          
            'receipt_paths'           => $a->receipt_paths ?? [],
            'clinical_notes' => $a->clinical_notes ?? [
    'intake'         => [],
    'progress'       => [],
    'recommendation' => [],
]
        ];
    }

    private function resolveVisitLabel(Appointment $appt): string
    {
        $reason = strtolower($appt->reason_for_consultation ?? '');

        if (str_contains($reason, 'follow')) return 'Follow Up';
        if (str_contains($reason, 'check'))  return 'Check Up';
        if (str_contains($reason, 'new') || str_contains($reason, 'concern')) return 'New Concern';

        return ucwords($appt->service_type ?? 'Consultation');
    }

    public function updateAppointmentStatus(Request $request, $id): JsonResponse
{
    try {
        $doctor = Auth::user();

        if ($doctor->role !== 'Doctor') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
        ]);

        $appointment = Appointment::where('appointment_id', $id)
            ->where('doctor_user_id', $doctor->id)
            ->firstOrFail();

        $appointment->status = $request->status;
        $appointment->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => [
                'appointment_id' => $appointment->appointment_id,
                'status' => $appointment->status,
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update status',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}