<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * AdminController
 * All routes protected by: auth:sanctum + RoleMiddleware:Admin
 */
class AdminController extends Controller
{
    // ──────────────────────────────────────────────
    // GET /api/admin/users
    // List all users (optionally filter by role)
    // ──────────────────────────────────────────────
    public function listUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('lastName')->get();

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    // ──────────────────────────────────────────────
    // GET /api/admin/users/{id}
    // ──────────────────────────────────────────────
    public function showUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    // ──────────────────────────────────────────────
    // POST /api/admin/users
    // Create Doctor or Admin accounts (Admin only)
    // ──────────────────────────────────────────────
    public function createUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName'     => 'required|string|max:100',
            'lastName'      => 'required|string|max:100',
            'middleInitial' => 'nullable|string|max:5',
            'dob'           => 'required|date|before:today',
            'sex'           => 'required|in:male,female',
            'contactNo'     => 'required|string|max:20',
            'email'         => 'required|email|unique:users,email',
            'password'      => ['required', Password::min(6)],
            'role'          => 'required|in:Admin,Doctor,Client',
            'address'       => 'nullable|string|max:255',
        ]);

        $user = User::create([
            ...$validated,
            'password'  => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$user->role} account created successfully.",
            'data'    => $user,
        ], 201);
    }

    // ──────────────────────────────────────────────
    // PUT /api/admin/users/{id}
    // ──────────────────────────────────────────────
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'firstName'     => 'sometimes|string|max:100',
            'lastName'      => 'sometimes|string|max:100',
            'middleInitial' => 'sometimes|nullable|string|max:5',
            'dob'           => 'sometimes|date|before:today',
            'sex'           => 'sometimes|in:male,female',
            'contactNo'     => 'sometimes|string|max:20',
            'email'         => "sometimes|email|unique:users,email,{$id}",
            'role'          => 'sometimes|in:Admin,Doctor,Client',
            'address'       => 'sometimes|nullable|string|max:255',
            'is_active'     => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => $user->fresh(),
        ]);
    }

    // ──────────────────────────────────────────────
    // PATCH /api/admin/users/{id}/toggle-status
    // Activate / deactivate a user
    // ──────────────────────────────────────────────
    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->is_active = ! $user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'success' => true,
            'message' => "User account {$status}.",
            'data'    => ['is_active' => $user->is_active],
        ]);
    }

    // ──────────────────────────────────────────────
    // DELETE /api/admin/users/{id}
    // Soft-delete by deactivating (safe approach)
    // ──────────────────────────────────────────────
    public function deleteUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if (auth()->id() === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 403);
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete(); // revoke sessions

        return response()->json([
            'success' => true,
            'message' => 'User deactivated successfully.',
        ]);
    }

    // ──────────────────────────────────────────────
    // GET /api/admin/dashboard
    // Summary counts
    // ──────────────────────────────────────────────
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'total_users'   => User::count(),
                'total_admins'  => User::where('role', User::ROLE_ADMIN)->count(),
                'total_doctors' => User::where('role', User::ROLE_DOCTOR)->count(),
                'total_clients' => User::where('role', User::ROLE_CLIENT)->count(),
                'active_users'  => User::where('is_active', true)->count(),
            ],
        ]);
    }
}