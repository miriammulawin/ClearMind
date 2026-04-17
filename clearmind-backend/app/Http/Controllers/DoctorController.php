<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * DoctorController
 * All routes protected by: auth:sanctum + RoleMiddleware:Doctor
 */
class DoctorController extends Controller
{
    // ──────────────────────────────────────────────
    // GET /api/doctor/profile
    // View own profile (includes doctor record with doctor_id)
    // ──────────────────────────────────────────────
 public function profile(Request $request): JsonResponse
{
    $user   = $request->user();
    $doctor = $user->doctor; // eager-load via the hasOne relation

   return response()->json([
    'data' => [
        // ✅ USER FIELDS (ADD THESE)
        'firstName'      => $user->firstName,
        'lastName'       => $user->lastName,
        'middleInitial'  => $user->middleInitial,
        'email'          => $user->email,
        'contactNo'      => $user->contactNo,
        'dob'            => $user->dob,
        'sex'            => $user->sex,
        'genderIdentity' => $user->genderIdentity,
        'address'        => $user->address,

        // ✅ DOCTOR FIELDS
        'professional_title'  => $doctor?->professional_title,
        'description'         => $doctor?->description,
        'license_number'      => $doctor?->license_number,
        'practicing_since'    => $doctor?->practicing_since,
        'main_specialty'      => $doctor?->main_specialty,

        'sub_specializations' => $doctor?->sub_specializations ?? [],
        'board_cert_names'    => $doctor?->board_cert_names ?? [],

        'board_cert_images'   => array_map(
            fn($p) => $p ? asset('storage/' . $p) : null,
            $doctor?->board_cert_images ?? []
        ),

        'id_pictures' => array_map(
            fn($p) => $p ? asset('storage/' . $p) : null,
            $doctor?->id_pictures ?? []
        ),

        'services' => $doctor?->services ?? [],

        // ✅ PROFILE PIC
        'profile_picture' => $doctor?->profile_picture
            ? asset('storage/' . $doctor->profile_picture)
            : ($user->profilePicture
                ? asset('storage/' . $user->profilePicture)
                : null),
    ]
]);
}
    // ──────────────────────────────────────────────
    // PUT /api/doctor/profile
    // Update own profile
    // ──────────────────────────────────────────────
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'firstName'     => 'sometimes|string|max:100',
            'lastName'      => 'sometimes|string|max:100',
            'middleInitial' => 'sometimes|nullable|string|max:5',
            'contactNo'     => 'sometimes|string|max:20',
            'address'       => 'sometimes|nullable|string|max:255',
        ]);

        $user->update($validated);

        $doctor = Doctor::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => $user->fresh(),
        ]);
    }

    public function updateDoctorProfile(Request $request): JsonResponse
{
    $user = $request->user();
    $doctor = $user->doctor;

    if (!$doctor) {
        return response()->json([
            'success' => false,
            'message' => 'Doctor profile not found.',
        ], 404);
    }

    $validated = $request->validate([
        'professional_title'  => 'sometimes|string|max:255',
        'license_number'      => 'sometimes|string|max:100',
        'main_specialty'      => 'sometimes|string|max:255',
        'practicing_since'    => 'sometimes|string|max:50',
        'sub_specializations' => 'sometimes|array',
        'services'            => 'sometimes|array',
        'board_cert_names'    => 'sometimes|array',
    ]);

    $doctor->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Doctor profile updated successfully.',
        'data'    => $doctor->fresh(),
    ]);
}

public function updateAccountSecurity(Request $request): JsonResponse
{
    $user = $request->user();

    $validated = $request->validate([
        'email' => 'sometimes|email|max:255',

        'current_password' => 'required_with:password|string',
        'password' => ['nullable', 'confirmed', Password::min(6)],
    ]);

    // 1. Update email
    if (isset($validated['email'])) {
        $user->email = $validated['email'];
    }

    // 2. Update password if provided
    if (!empty($validated['password'])) {

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->password = Hash::make($validated['password']);
    }

    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Account updated successfully',
        'data' => $user->fresh(),
    ]);
}

    // ──────────────────────────────────────────────
    // PUT /api/doctor/change-password
    // ──────────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    // ──────────────────────────────────────────────
    // GET /api/doctor/clients
    // View all client accounts
    // ──────────────────────────────────────────────
    public function listClients(): JsonResponse
    {
        $clients = User::where('role', User::ROLE_CLIENT)
            ->where('is_active', true)
            ->orderBy('lastName')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $clients,
        ]);
    }

    // ──────────────────────────────────────────────
    // GET /api/doctor/clients/{id}
    // ──────────────────────────────────────────────
    public function showClient(int $id): JsonResponse
    {
        $client = User::where('id', $id)
            ->where('role', User::ROLE_CLIENT)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $client,
        ]);
    }
}