<?php

namespace App\Http\Controllers;

use App\Models\AssessmentRequirement;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AssessmentRequirementController extends Controller
{
    /* ══════════════════════════════════════════════
       POST /assessment-requirements
       Called right after appointment is created
    ══════════════════════════════════════════════ */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'appointment_id'        => ['required', 'exists:appointments,appointment_id', 'unique:assessment_requirements,appointment_id'],
            'patient_id'            => ['required', 'exists:patients,patient_id'],
            'doctor_user_id'        => ['nullable', 'exists:users,id'],
            'purpose_id'            => ['nullable', 'exists:assessment_purposes,purpose_id'],

            // VAWC / Legal docs
            'blotter_report'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'police_report'         => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'cswd_endorsement'      => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            // Legal
            'legal_type'            => ['nullable', 'string', 'max:100'],

            // School
            'school_institution'    => ['nullable', 'string', 'max:200'],
            'incident_report'       => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],

            // Work-related
            'company_employer'      => ['nullable', 'string', 'max:200'],

            // Pre-Employment
            'employer_name'         => ['nullable', 'string', 'max:200'],
            'wants_printed_report'  => ['nullable', 'boolean'],

            // ESA
            'travel_type'           => ['nullable', 'in:Local,International'],
            'has_diagnosis'         => ['nullable', 'boolean'],
            'diagnosis_file'        => ['nullable', 'file', 'mimes:pdf', 'max:5120'],

            // Internship
            'school_name'           => ['nullable', 'string', 'max:200'],
            'program'               => ['nullable', 'string', 'max:200'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        $uploadedPaths = [];

        try {
            // ── Handle file uploads ───────────────────────────────────
            $fileFields = [
                'blotter_report'    => 'blotter_report_path',
                'police_report'     => 'police_report_path',
                'cswd_endorsement'  => 'cswd_endorsement_path',
                'incident_report'   => 'incident_report_path',
                'diagnosis_file'    => 'diagnosis_file_path',
            ];

            $storedPaths = [];
            foreach ($fileFields as $inputKey => $dbColumn) {
                if ($request->hasFile($inputKey)) {
                    $path = $request->file($inputKey)
                        ->store('assessment_requirements', 'public');
                    $storedPaths[$dbColumn] = $path;
                    $uploadedPaths[] = $path; // for rollback
                }
            }

            // ── Create record ─────────────────────────────────────────
            $requirement = AssessmentRequirement::create([
                'appointment_id'        => $request->appointment_id,
                'patient_id'            => $request->patient_id,
                'doctor_user_id'        => $request->doctor_user_id,
                'purpose_id'            => $request->purpose_id,

                // Docs
                'blotter_report_path'   => $storedPaths['blotter_report_path'] ?? null,
                'police_report_path'    => $storedPaths['police_report_path'] ?? null,
                'cswd_endorsement_path' => $storedPaths['cswd_endorsement_path'] ?? null,
                'incident_report_path'  => $storedPaths['incident_report_path'] ?? null,
                'diagnosis_file_path'   => $storedPaths['diagnosis_file_path'] ?? null,

                // Legal
                'legal_type'            => $request->legal_type,

                // School
                'school_institution'    => $request->school_institution,

                // Work-related
                'company_employer'      => $request->company_employer,

                // Pre-Employment
                'employer_name'         => $request->employer_name,
                'wants_printed_report'  => $request->wants_printed_report,

                // ESA
                'travel_type'           => $request->travel_type,
                'has_diagnosis'         => $request->has_diagnosis,

                // Internship
                'school_name'           => $request->school_name,
                'program'               => $request->program,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Assessment requirements saved successfully.',
                'data'    => $requirement,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // Cleanup uploaded files on failure
            foreach ($uploadedPaths as $path) {
                Storage::disk('public')->delete($path);
            }
            return response()->json([
                'message' => 'Failed to save assessment requirements.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /* ══════════════════════════════════════════════
       GET /assessment-requirements/{appointment_id}
    ══════════════════════════════════════════════ */
    public function show(int $appointmentId): JsonResponse
    {
        try {
            $requirement = AssessmentRequirement::with(['appointment', 'patient'])
                ->where('appointment_id', $appointmentId)
                ->firstOrFail();

            $user = Auth::user();

            // Only owner or doctor can view
            if ($user->role === 'Client' &&
                $requirement->appointment->booked_by_user_id !== $user->id) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
            if ($user->role === 'Doctor' &&
                $requirement->doctor_user_id !== $user->id) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }

            return response()->json(['data' => $requirement]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Record not found.'], 404);
        }
    }

    /* ══════════════════════════════════════════════
       PUT /assessment-requirements/{appointment_id}
    ══════════════════════════════════════════════ */
    public function update(Request $request, int $appointmentId): JsonResponse
    {
        $requirement = AssessmentRequirement::where('appointment_id', $appointmentId)->first();

        if (!$requirement) {
            return response()->json(['message' => 'Record not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'legal_type'            => ['nullable', 'string', 'max:100'],
            'school_institution'    => ['nullable', 'string', 'max:200'],
            'company_employer'      => ['nullable', 'string', 'max:200'],
            'employer_name'         => ['nullable', 'string', 'max:200'],
            'wants_printed_report'  => ['nullable', 'boolean'],
            'travel_type'           => ['nullable', 'in:Local,International'],
            'has_diagnosis'         => ['nullable', 'boolean'],
            'school_name'           => ['nullable', 'string', 'max:200'],
            'program'               => ['nullable', 'string', 'max:200'],
            'blotter_report'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'police_report'         => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'cswd_endorsement'      => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'incident_report'       => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'diagnosis_file'        => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $fileFields = [
                'blotter_report'   => 'blotter_report_path',
                'police_report'    => 'police_report_path',
                'cswd_endorsement' => 'cswd_endorsement_path',
                'incident_report'  => 'incident_report_path',
                'diagnosis_file'   => 'diagnosis_file_path',
            ];

            foreach ($fileFields as $inputKey => $dbColumn) {
                if ($request->hasFile($inputKey)) {
                    // Delete old file first
                    if ($requirement->$dbColumn) {
                        Storage::disk('public')->delete($requirement->$dbColumn);
                    }
                    $requirement->$dbColumn = $request->file($inputKey)
                        ->store('assessment_requirements', 'public');
                }
            }

            $requirement->fill($request->only([
                'legal_type', 'school_institution', 'company_employer',
                'employer_name', 'wants_printed_report', 'travel_type',
                'has_diagnosis', 'school_name', 'program',
            ]));

            $requirement->save();

            return response()->json([
                'message' => 'Assessment requirements updated.',
                'data'    => $requirement,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}