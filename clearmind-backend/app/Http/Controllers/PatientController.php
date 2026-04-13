<?php
// app/Http/Controllers/PatientController.php
namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PatientController extends Controller
{
    /* ══════════════════════════════════════════════
       GET /admin/patients          — paginated list
       GET /admin/patients?search=  — search by name
    ══════════════════════════════════════════════ */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Patient::with('user')
                ->where('is_active', true)
                ->orderBy('lastName')
                ->orderBy('firstName');

            // Search by name, email, or contact
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('firstName',  'like', "%{$s}%")
                      ->orWhere('lastName',  'like', "%{$s}%")
                      ->orWhere('email',     'like', "%{$s}%")
                      ->orWhere('contactNo', 'like', "%{$s}%");
                });
            }

            // Paginate (default 15 per page)
            $perPage = $request->input('per_page', 15);
            $patients = $query->paginate($perPage);

            return response()->json([
                'data'       => $patients->items(),
                'pagination' => [
                    'total'        => $patients->total(),
                    'per_page'     => $patients->perPage(),
                    'current_page' => $patients->currentPage(),
                    'last_page'    => $patients->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       GET /admin/patients/all  — full list (for dropdowns)
    ══════════════════════════════════════════════ */
    public function all(): JsonResponse
    {
        try {
            $patients = Patient::select(
                    'patient_id', 'firstName', 'lastName',
                    'middleInitial', 'contactNo', 'email'
                )
                ->where('is_active', true)
                ->orderBy('lastName')
                ->get();

            return response()->json(['data' => $patients]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       GET /admin/patients/{id}
    ══════════════════════════════════════════════ */
    public function show(int $id): JsonResponse
    {
        try {
            $patient = Patient::with(['user', 'appointments.doctor'])
                ->findOrFail($id);

            return response()->json(['data' => $patient]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Patient not found.'], 404);
        }
    }

    /* ══════════════════════════════════════════════
       POST /admin/patients  — manually create a patient
       (Admin can create a patient without an appointment)
    ══════════════════════════════════════════════ */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'firstName'             => ['required', 'string', 'max:100'],
            'lastName'              => ['required', 'string', 'max:100'],
            'middleInitial'         => ['nullable', 'string', 'max:5'],
            'dob'                   => ['nullable', 'date'],
            'sex'                   => ['nullable', 'in:male,female,other'],
            'genderIdentity'        => ['nullable', 'string'],
            'civilStatus'           => ['nullable', 'in:single,married,widowed,divorced,separated'],
            'patientClassification' => ['nullable', 'in:PWD,Senior Citizen,Regular'],
            'contactNo'             => ['nullable', 'string', 'max:20'],
            'email'                 => ['nullable', 'email', 'max:191'],
            'address'               => ['nullable', 'string'],
            'notes'                 => ['nullable', 'string'],
            // Optionally link to a registered user account
            'user_id'               => ['nullable', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $patient = Patient::create([
                'user_id'               => $request->user_id,
                'firstName'             => $request->firstName,
                'lastName'              => $request->lastName,
                'middleInitial'         => $request->middleInitial,
                'dob'                   => $request->dob,
                'sex'                   => $request->sex,
                'genderIdentity'        => $request->genderIdentity,
                'civilStatus'           => $request->civilStatus,
                'patientClassification' => $request->patientClassification ?? 'Regular',
                'contactNo'             => $request->contactNo,
                'email'                 => $request->email,
                'address'               => $request->address,
                'notes'                 => $request->notes,
            ]);

            return response()->json([
                'message' => 'Patient created successfully.',
                'data'    => $patient->fresh('user'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       PUT /admin/patients/{id}
    ══════════════════════════════════════════════ */
    public function update(Request $request, int $id): JsonResponse
    {
        $patient = Patient::find($id);
        if (!$patient) {
            return response()->json(['message' => 'Patient not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'firstName'             => ['sometimes', 'required', 'string', 'max:100'],
            'lastName'              => ['sometimes', 'required', 'string', 'max:100'],
            'middleInitial'         => ['nullable', 'string', 'max:5'],
            'dob'                   => ['nullable', 'date'],
            'sex'                   => ['nullable', 'in:male,female,other'],
            'genderIdentity'        => ['nullable', 'string'],
            'civilStatus'           => ['nullable', 'in:single,married,widowed,divorced,separated'],
            'patientClassification' => ['nullable', 'in:PWD,Senior Citizen,Regular'],
            'contactNo'             => ['nullable', 'string', 'max:20'],
            'email'                 => ['nullable', 'email', 'max:191'],
            'address'               => ['nullable', 'string'],
            'notes'                 => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $patient->update($request->only([
                'firstName', 'lastName', 'middleInitial',
                'dob', 'sex', 'genderIdentity',
                'civilStatus', 'patientClassification',
                'contactNo', 'email', 'address', 'notes',
            ]));

            return response()->json([
                'message' => 'Patient updated successfully.',
                'data'    => $patient->fresh('user'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       DELETE /admin/patients/{id}  — soft deactivate
    ══════════════════════════════════════════════ */
    public function destroy(int $id): JsonResponse
    {
        $patient = Patient::find($id);
        if (!$patient) {
            return response()->json(['message' => 'Patient not found.'], 404);
        }

        try {
            // Soft deactivate (keep record for appointment history)
            $patient->update(['is_active' => false]);

            return response()->json(['message' => 'Patient deactivated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /* ══════════════════════════════════════════════
       GET /admin/patients/{id}/appointments
       — full appointment history for a patient
    ══════════════════════════════════════════════ */
    public function appointments(int $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);

            $appointments = $patient->appointments()
                ->with(['doctor', 'bookedBy'])
                ->orderByDesc('appointment_date')
                ->get();

            return response()->json([
                'patient' => $patient->only([
                    'patient_id', 'firstName', 'lastName',
                    'middleInitial', 'full_name',
                ]),
                'data' => $appointments,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Patient not found.'], 404);
        }
    }
}