<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use App\Models\ConsultationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * GET /admin/dashboard/stats
     * Returns comprehensive dashboard statistics
     */
    public function stats(Request $request): JsonResponse
    {
        // ── Verify user is admin ──
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        try {
            // ── Patient Stats ──
            $totalPatients = User::where('role', User::ROLE_CLIENT)->count();
            $activePatients = User::where('role', User::ROLE_CLIENT)
                                  ->where('is_active', true)
                                  ->count();
            $inactivePatients = User::where('role', User::ROLE_CLIENT)
                                    ->where('is_active', false)
                                    ->count();

            // ── Monthly patients (all 12 months of current year) ──
            $monthlyPatients = [];
            $currentYear = now()->year;
            
            for ($month = 1; $month <= 12; $month++) {
                $count = User::where('role', User::ROLE_CLIENT)
                            ->whereYear('created_at', $currentYear)
                            ->whereMonth('created_at', $month)
                            ->count();
                $monthlyPatients[] = $count;
            }

            // ── Today's Appointments ──
            $today = now()->toDateString();
            $todayAppointments = Appointment::whereDate('appointment_date', $today)
                                           ->with(['patient:id,firstName,lastName,email,contactNo', 'doctor:id,firstName,lastName'])
                                           ->get()
                                           ->map(fn($a) => [
                                               'id'                  => $a->id,
                                               'patient_id'          => $a->patient_id,
                                               'patient'             => $a->patient ? "{$a->patient->firstName} {$a->patient->lastName}" : null,
                                               'patient_email'       => $a->patient?->email,
                                               'patient_contact'     => $a->patient?->contactNo,
                                               'doctor_id'           => $a->doctor_id,
                                               'doctor'              => $a->doctor ? "Dr. {$a->doctor->firstName} {$a->doctor->lastName}" : 'Unassigned',
                                               'appointment_date'    => $a->appointment_date?->toDateString(),
                                               'appointment_time'    => $a->appointment_time,
                                               'type'                => $a->type,
                                               'status'              => $a->status,
                                               'reason'              => $a->reason,
                                           ]);

            $todayTotal = $todayAppointments->count();
            $todayOnline = $todayAppointments->where('type', 'online')->count();
            $todayPhysical = $todayAppointments->where('type', 'physical')->count();

            // ── Today's Consultation Requests ──
            $todayRequests = ConsultationRequest::whereDate('created_at', $today)
                                               ->with('patient:id,firstName,lastName')
                                               ->get()
                                               ->map(fn($r) => [
                                                   'id'       => $r->id,
                                                   'patient'  => $r->patient ? "{$r->patient->firstName} {$r->patient->lastName}" : null,
                                                   'concern'  => $r->concern,
                                                   'urgency'  => $r->urgency,
                                               ]);

            $totalPendingRequests = ConsultationRequest::where('status', 'pending')->count();

            return response()->json([
                'success' => true,
                'data'    => [
                    'totalPatients'         => $totalPatients,
                    'activePatients'        => $activePatients,
                    'inactivePatients'      => $inactivePatients,
                    'monthlyPatients'       => $monthlyPatients,
                    'todayTotal'            => $todayTotal,
                    'todayOnline'           => $todayOnline,
                    'todayPhysical'         => $todayPhysical,
                    'todayAppointments'     => $todayAppointments->toArray(),
                    'totalPendingRequests'  => $totalPendingRequests,
                    'todayRequests'         => $todayRequests->toArray(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController@stats error:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /admin/patients
     * Returns all patients with basic info
     */
    public function getPatients(Request $request): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        try {
            $patients = User::where('role', User::ROLE_CLIENT)
                           ->select([
                               'id', 'firstName', 'lastName', 'email', 'contactNo',
                               'dob', 'sex', 'genderIdentity', 'address', 'is_active', 'created_at'
                           ])
                           ->orderBy('created_at', 'desc')
                           ->get();

            return response()->json([
                'success' => true,
                'data'    => $patients,
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController@getPatients error:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patients.',
            ], 500);
        }
    }

    /**
     * GET /admin/patients/paginated
     * Returns paginated patients
     */
    public function getPaginatedPatients(Request $request): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);

        try {
            $patients = User::where('role', User::ROLE_CLIENT)
                           ->select([
                               'id', 'firstName', 'lastName', 'email', 'contactNo',
                               'dob', 'sex', 'genderIdentity', 'address', 'is_active', 'created_at'
                           ])
                           ->orderBy('created_at', 'desc')
                           ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data'    => $patients->items(),
                'meta'    => [
                    'total'        => $patients->total(),
                    'per_page'     => $patients->perPage(),
                    'current_page' => $patients->currentPage(),
                    'last_page'    => $patients->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController@getPaginatedPatients error:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch paginated patients.',
            ], 500);
        }
    }

    /**
     * GET /admin/patients/stats
     * Returns patient statistics
     */
    public function getPatientStats(Request $request): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        try {
            $totalPatients = User::where('role', User::ROLE_CLIENT)->count();
            $activePatients = User::where('role', User::ROLE_CLIENT)
                                  ->where('is_active', true)
                                  ->count();
            $inactivePatients = User::where('role', User::ROLE_CLIENT)
                                    ->where('is_active', false)
                                    ->count();

            $maleCount = User::where('role', User::ROLE_CLIENT)
                            ->where('sex', 'male')
                            ->count();
            $femaleCount = User::where('role', User::ROLE_CLIENT)
                              ->where('sex', 'female')
                              ->count();
            $otherCount = User::where('role', User::ROLE_CLIENT)
                             ->where('sex', 'other')
                             ->count();

            return response()->json([
                'success' => true,
                'data'    => [
                    'totalPatients'     => $totalPatients,
                    'activePatients'    => $activePatients,
                    'inactivePatients'  => $inactivePatients,
                    'maleCount'         => $maleCount,
                    'femaleCount'       => $femaleCount,
                    'otherCount'        => $otherCount,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController@getPatientStats error:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patient stats.',
            ], 500);
        }
    }

    /**
     * GET /admin/patients/{id}
     * Returns a single patient with details
     */
    public function getPatient(Request $request, int $id): JsonResponse
    {
        if ($request->user()->role !== User::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        try {
            $patient = User::where('role', User::ROLE_CLIENT)
                          ->find($id);

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $patient,
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController@getPatient error:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patient.',
            ], 500);
        }
    }
}