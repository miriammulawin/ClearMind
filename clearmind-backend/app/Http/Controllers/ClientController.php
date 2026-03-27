<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * ClientController
 * All routes protected by: auth:sanctum + RoleMiddleware:Client
 */
class ClientController extends Controller
{
    // ──────────────────────────────────────────────
    // GET /api/client/profile
    // ──────────────────────────────────────────────
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $request->user(),
        ]);
    }

    // ──────────────────────────────────────────────
    // PUT /api/client/profile
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
    // PUT /api/client/change-password
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
}