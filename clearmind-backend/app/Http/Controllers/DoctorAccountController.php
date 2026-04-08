<?php

namespace App\Http\Controllers;

use App\Mail\DoctorAccountCreated;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

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

        // Password = their birthday e.g. "1990-07-22"
        $plainPassword = $request->dob;

        // ── Check if email already exists ────────────────────────────
        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            // Already has an account — just re-send their credentials email
            Mail::to($existingUser->email)->send(
                new DoctorAccountCreated($existingUser, $plainPassword, isExisting: true)
            );

            return response()->json([
                'message'     => 'Account already exists. Credentials email has been resent.',
                'is_existing' => true,
                'data'        => $existingUser->load('doctor'),
            ], 200);
        }

        // ── Create new account ───────────────────────────────────────
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

            // Send welcome email with credentials
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

    public function index(): JsonResponse
{
    $doctors = User::with('doctor')
        ->where('role', 'Doctor')
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'data' => $doctors,
    ]);
}
}