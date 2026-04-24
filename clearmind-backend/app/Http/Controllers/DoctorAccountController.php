<?php

namespace App\Http\Controllers;

use App\Mail\DoctorAccountCreated;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\DoctorSchedule;

class DoctorAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'firstName'     => ['required', 'string', 'max:100'],
            'lastName'      => ['required', 'string', 'max:100'],
            'middleInitial' => ['nullable', 'string', 'max:5'],
            'sex'           => ['nullable', 'in:male,female,other'],
            'dob'           => ['required', 'date', 'before:today'],

            'email'         => ['required', 'email'],
            'contactNo'     => ['nullable', 'string', 'max:20'],
            'address'       => ['nullable', 'string', 'max:255'],
        ]);

        $plainPassword = $request->dob;

        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            Mail::to($existingUser->email)->send(
                new DoctorAccountCreated($existingUser, $plainPassword, isExisting: true)
            );

            return response()->json([
                'message'     => 'Account already exists. Credentials email has been resent.',
                'is_existing' => true,
                'data'        => $existingUser->load('doctor'),
            ], 200);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'firstName'     => $request->firstName,
                'lastName'      => $request->lastName,
                'middleInitial' => $request->middleInitial,
                'sex'           => $request->sex,
                'dob'           => $request->dob,
                'email'         => $request->email,
                'contactNo'     => $request->contactNo ?? '',
                'address'       => $request->address,
                'role'          => 'Doctor',
                'is_active'     => true,
                'password'      => Hash::make($plainPassword),
            ]);

            $user->doctor()->create([
                'profile_completed' => false,
            ]);

            DB::commit();

            Mail::to($user->email)->send(
                new DoctorAccountCreated($user, $plainPassword, isExisting: false)
            );

            return response()->json([
                'message'     => 'Doctor account created successfully. Credentials sent to email.',
                'is_existing' => false,
                'data'        => $user->load('doctor'),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create account.',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ], 500);
        }
    }

    /* ─────────────────────────────────────────────────────────────────
       GET /api/doctors/list  &  GET /api/admin/doctors
       
       FIX: Flatten doctor_id to the top level of each item so the
       frontend can call GET /api/doctors/{doctor_id}/schedules with
       the correct primary key from the doctors table.

       Before this fix the response looked like:
         { id: 3, firstName: "...", doctor: { doctor_id: 7, ... } }

       The schedule endpoint needs doctor_id = 7, but the frontend
       was sending id = 3 (the users.id), causing the 404.

       After this fix the response looks like:
         { id: 3, doctor_id: 7, firstName: "...", doctor: { ... } }
    ───────────────────────────────────────────────────────────────── */
   public function index(): JsonResponse
{
    $doctors = User::with(['doctor', 'doctor.schedules' => function($q) {
            $q->where('is_active', true)->orderBy('day_of_week');
        }])
        ->where('role', 'Doctor')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function (User $user) {
            $schedules = $user->doctor?->schedules?->map(fn($s) => [
                'day_num'    => $s->day_of_week,
                'day'        => DoctorSchedule::DAY_NAMES[$s->day_of_week],
                'start_time' => $s->start_time,
                'end_time'   => $s->end_time,
                'slot_type'  => $s->slot_type,
            ]) ?? collect();

            return [
                'id'                 => $user->id,
                'doctor_id'          => $user->doctor?->doctor_id,
                'firstName'          => $user->firstName,
                'lastName'           => $user->lastName,
                'middleInitial'      => $user->middleInitial,
                'email'              => $user->email,
                'contactNo'          => $user->contactNo,
                'role'               => $user->role,
                'is_active'          => $user->is_active,
                'created_at'         => $user->created_at,
                'specialization'     => $user->doctor?->main_specialty,
                'specializations'    => $user->doctor?->specializations,
                'professional_title' => $user->doctor?->professional_title,
                'license_number'     => $user->doctor?->license_number,
                'profile_completed'  => $user->doctor?->profile_completed,
                'doctor'             => $user->doctor,
                'schedules'          => $schedules, // ← DAGDAG
            ];
        });

    return response()->json([
        'data' => $doctors,
    ]);
}

    /* ─────────────────────────────────────────────────────────────────
       GET /api/admin/doctors/{id}
    ───────────────────────────────────────────────────────────────── */
    public function show(int $id): JsonResponse
    {
        $user = User::with('doctor')
            ->where('role', 'Doctor')
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id'                 => $user->id,
                'doctor_id'          => $user->doctor?->doctor_id,
                'firstName'          => $user->firstName,
                'lastName'           => $user->lastName,
                'middleInitial'      => $user->middleInitial,
                'email'              => $user->email,
                'contactNo'          => $user->contactNo,
                'role'               => $user->role,
                'is_active'          => $user->is_active,
                'specialization'     => $user->doctor?->main_specialty,
                'professional_title' => $user->doctor?->professional_title,
                'license_number'     => $user->doctor?->license_number,
                'profile_completed'  => $user->doctor?->profile_completed,
                'doctor'             => $user->doctor,
            ],
        ]);
    }

    /* ─────────────────────────────────────────────────────────────────
       PUT /api/admin/doctors/{id}
    ───────────────────────────────────────────────────────────────── */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::where('role', 'Doctor')->findOrFail($id);

        $validated = $request->validate([
            'firstName'     => ['sometimes', 'string', 'max:100'],
            'lastName'      => ['sometimes', 'string', 'max:100'],
            'middleInitial' => ['nullable', 'string', 'max:5'],
            'email'         => ['sometimes', 'email', 'max:255'],
            'contactNo'     => ['nullable', 'string', 'max:20'],
            'is_active'     => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Doctor updated successfully.',
            'data'    => $user->fresh()->load('doctor'),
        ]);
    }
}