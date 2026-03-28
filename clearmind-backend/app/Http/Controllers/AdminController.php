<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get all patients (clients) with optional filters
     */
    public function getPatients(Request $request): JsonResponse
    {
        try {
            $query = User::where('role', 'Client');

            // Search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('firstName', 'LIKE', "%{$search}%")
                        ->orWhere('lastName', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%")
                        ->orWhere('contactNo', 'LIKE', "%{$search}%");
                });
            }

            // Sex filter
            if ($request->has('sex') && $request->sex) {
                $query->where('sex', $request->sex);
            }

            // Gender identity filter
            if ($request->has('genderIdentity') && $request->genderIdentity) {
                $query->where('genderIdentity', $request->genderIdentity);
            }

            // Pronoun filter
            if ($request->has('preferredPronoun') && $request->preferredPronoun) {
                $query->where('preferredPronoun', $request->preferredPronoun);
            }

            // Status filter
            if ($request->has('status') && $request->status) {
                if ($request->status === 'active') {
                    $query->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Sorting
            $sortBy = $request->input('sortBy', 'created_at');
            $sortOrder = $request->input('sortOrder', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Get all patients (frontend will handle pagination)
            $patients = $query->get()->map(function ($patient) {
                return $this->formatPatientData($patient);
            });

            return response()->json([
                'success' => true,
                'data' => $patients,
                'count' => $patients->count(),
                'message' => 'Patients retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patients: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get paginated patients
     */
    public function getPaginatedPatients(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('perPage', 10);
            $page = $request->input('page', 1);

            $query = User::where('role', 'Client');

            // Apply filters (same as above)
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('firstName', 'LIKE', "%{$search}%")
                        ->orWhere('lastName', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%")
                        ->orWhere('contactNo', 'LIKE', "%{$search}%");
                });
            }

            if ($request->has('sex') && $request->sex) {
                $query->where('sex', $request->sex);
            }

            if ($request->has('genderIdentity') && $request->genderIdentity) {
                $query->where('genderIdentity', $request->genderIdentity);
            }

            if ($request->has('preferredPronoun') && $request->preferredPronoun) {
                $query->where('preferredPronoun', $request->preferredPronoun);
            }

            if ($request->has('status') && $request->status) {
                if ($request->status === 'active') {
                    $query->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Sorting
            $sortBy = $request->input('sortBy', 'created_at');
            $sortOrder = $request->input('sortOrder', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $patients = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $patients->getCollection()->map(function ($patient) {
                    return $this->formatPatientData($patient);
                }),
                'pagination' => [
                    'total' => $patients->total(),
                    'perPage' => $patients->perPage(),
                    'currentPage' => $patients->currentPage(),
                    'lastPage' => $patients->lastPage(),
                    'from' => $patients->firstItem(),
                    'to' => $patients->lastItem(),
                ],
                'message' => 'Paginated patients retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving paginated patients: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get patient statistics
     */
    public function getPatientStats(): JsonResponse
    {
        try {
            $totalPatients = User::where('role', 'Client')->count();
            $activePatients = User::where('role', 'Client')->where('is_active', true)->count();
            $inactivePatients = User::where('role', 'Client')->where('is_active', false)->count();

            // Gender distribution
            $genderDistribution = User::where('role', 'Client')
                ->groupBy('genderIdentity')
                ->selectRaw('genderIdentity, COUNT(*) as count')
                ->get()
                ->keyBy('genderIdentity');

            // Sex distribution
            $sexDistribution = User::where('role', 'Client')
                ->groupBy('sex')
                ->selectRaw('sex, COUNT(*) as count')
                ->get()
                ->keyBy('sex');

            // Pronoun distribution
            $pronounDistribution = User::where('role', 'Client')
                ->groupBy('preferredPronoun')
                ->selectRaw('preferredPronoun, COUNT(*) as count')
                ->get()
                ->keyBy('preferredPronoun');

            return response()->json([
                'success' => true,
                'data' => [
                    'totalPatients' => $totalPatients,
                    'activePatients' => $activePatients,
                    'inactivePatients' => $inactivePatients,
                    'genderDistribution' => $genderDistribution,
                    'sexDistribution' => $sexDistribution,
                    'pronounDistribution' => $pronounDistribution,
                ],
                'message' => 'Patient statistics retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient statistics: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single patient details
     */
    public function getPatient($id): JsonResponse
    {
        try {
            $patient = User::findOrFail($id);

            if ($patient->role !== 'Client') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a patient',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatPatientData($patient),
                'message' => 'Patient retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format patient data for response
     */
    private function formatPatientData($patient): array
    {
        return [
            'id' => $patient->id,
            'firstName' => $patient->firstName,
            'lastName' => $patient->lastName,
            'middleInitial' => $patient->middleInitial,
            'fullName' => "{$patient->firstName} {$patient->lastName}",
            'dob' => $patient->dob,
            'sex' => $patient->sex,
            'genderIdentity' => $patient->genderIdentity,
            'preferredPronoun' => $patient->preferredPronoun,
            'customPronoun' => $patient->customPronoun,
            'displayPronoun' => $patient->preferredPronoun === 'other' ? $patient->customPronoun : $patient->preferredPronoun,
            'contactNo' => $patient->contactNo,
            'email' => $patient->email,
            'address' => $patient->address,
            'is_active' => $patient->is_active,
            'created_at' => $patient->created_at,
            'updated_at' => $patient->updated_at,
        ];
    }
}