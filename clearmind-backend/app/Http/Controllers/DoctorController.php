<?php

namespace App\Http\Controllers;

use App\Models\User;
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
    // View own profile
    // ──────────────────────────────────────────────
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $request->user(),
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

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => $user->fresh(),
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