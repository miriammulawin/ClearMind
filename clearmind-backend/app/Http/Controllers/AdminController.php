<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ConsultationRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * GET /admin/dashboard/stats
     * Returns all stats needed for the admin dashboard in one call.
     */
    public function stats(): JsonResponse
    {
        $today = today();

        // ── Patient Stats ──
        $patients         = User::where('role', User::ROLE_CLIENT)->get();
        $totalPatients    = $patients->count();
        $activePatients   = $patients->where('is_active', true)->count();
        $inactivePatients = $patients->where('is_active', false)->count();

        // Monthly registration counts for current year
        $currentYear   = $today->year;
        $monthlyPatients = array_fill(0, 12, 0); // index 0=Jan ... 11=Dec
        foreach ($patients as $p) {
            if ($p->created_at && $p->created_at->year === $currentYear) {
                $monthlyPatients[$p->created_at->month - 1]++;
            }
        }

        // ── Today's Appointments ──
        $todayAppointments = Appointment::whereDate('appointment_date', $today)
            ->whereIn('status', [
                Appointment::STATUS_PENDING,
                Appointment::STATUS_CONFIRMED,
            ])
            ->with(['patient:id,firstName,lastName', 'doctor:id,firstName,lastName'])
            ->orderBy('appointment_time')
            ->get();

        $todayOnline   = $todayAppointments->where('type', Appointment::TYPE_ONLINE)->count();
        $todayPhysical = $todayAppointments->where('type', Appointment::TYPE_PHYSICAL)->count();
        $todayTotal    = $todayAppointments->count();

        // ── Today's Consultation Requests ──
        $todayRequests = ConsultationRequest::whereDate('created_at', $today)
            ->where('status', ConsultationRequest::STATUS_PENDING)
            ->with('patient:id,firstName,lastName')
            ->orderByRaw("FIELD(urgency, 'emergency', 'high', 'normal', 'low')")
            ->get();

        $totalPendingRequests = ConsultationRequest::pending()->count();

        return response()->json([
            'success' => true,
            'data'    => [
                // Patients
                'totalPatients'    => $totalPatients,
                'activePatients'   => $activePatients,
                'inactivePatients' => $inactivePatients,
                'monthlyPatients'  => $monthlyPatients,

                // Today's appointments
                'todayTotal'       => $todayTotal,
                'todayOnline'      => $todayOnline,
                'todayPhysical'    => $todayPhysical,
                'todayAppointments' => $todayAppointments->map(fn($a) => [
                    'id'               => $a->id,
                    'patient'          => $a->patient?->firstName . ' ' . $a->patient?->lastName,
                    'doctor'           => $a->doctor
                                            ? $a->doctor->firstName . ' ' . $a->doctor->lastName
                                            : 'Unassigned',
                    'appointment_date' => $a->appointment_date->toDateString(),
                    'appointment_time' => $a->appointment_time,
                    'type'             => $a->type,
                    'status'           => $a->status,
                    'reason'           => $a->reason,
                ]),

                // Consultation requests
                'totalPendingRequests' => $totalPendingRequests,
                'todayRequests'        => $todayRequests->map(fn($r) => [
                    'id'             => $r->id,
                    'patient'        => $r->patient?->firstName . ' ' . $r->patient?->lastName,
                    'concern'        => $r->concern,
                    'urgency'        => $r->urgency,
                    'type'           => $r->type,
                    'preferred_date' => $r->preferred_date?->toDateString(),
                    'preferred_time' => $r->preferred_time,
                    'status'         => $r->status,
                    'created_at'     => $r->created_at->toDateTimeString(),
                ]),
            ],
        ]);
    }

    /**
     * GET /admin/patients
     * Returns all patients (Clients) with pagination support.
     */
    public function patients(Request $request): JsonResponse
    {
        $query = User::where('role', User::ROLE_CLIENT);

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('firstName', 'like', "%{$search}%")
                  ->orWhere('lastName',  'like', "%{$search}%")
                  ->orWhere('email',     'like', "%{$search}%")
                  ->orWhere('contactNo', 'like', "%{$search}%");
            });
        }

        // Filter by sex
        if ($sex = $request->get('sex')) {
            $query->where('sex', $sex);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $patients = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $patients->map(fn($p) => [
                'id'             => $p->id,
                'firstName'      => $p->firstName,
                'lastName'       => $p->lastName,
                'sex'            => $p->sex,
                'genderIdentity' => $p->genderIdentity,
                'email'          => $p->email,
                'contactNo'      => $p->contactNo,
                'is_active'      => $p->is_active,
                'created_at'     => $p->created_at,
            ]),
        ]);
    }
}