<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName'     => 'required|string|max:100',
            'lastName'      => 'required|string|max:100',
            'middleInitial' => 'required|string|max:5',
            'dob'           => 'required|date|before:today',
            'sex'           => 'required|in:male,female',
            'contactNo'     => 'required|string|max:20',
            'email'         => 'required|email|unique:users,email',
            'password'      => ['required', 'confirmed', Password::min(6)],
            'address'       => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'firstName'     => $validated['firstName'],
            'lastName'      => $validated['lastName'],
            'middleInitial' => $validated['middleInitial'],
            'dob'           => $validated['dob'],
            'sex'           => $validated['sex'],
            'contactNo'     => $validated['contactNo'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'address'       => $validated['address'] ?? null,
            'role'          => User::ROLE_CLIENT,
            'is_active'     => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data'    => [
                'token' => $token,
                'user'  => $this->userPayload($user),
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'token' => $token,
                'role'  => $user->role,
                'user'  => $this->userPayload($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->userPayload($request->user()),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'            => $user->id,
            'firstName'     => $user->firstName,
            'lastName'      => $user->lastName,
            'middleInitial' => $user->middleInitial,
            'fullName'      => $user->full_name,
            'dob'           => $user->dob,
            'sex'           => $user->sex,
            'contactNo'     => $user->contactNo,
            'email'         => $user->email,
            'address'       => $user->address,
            'role'          => $user->role,
            'is_active'     => $user->is_active,
            'created_at'    => $user->created_at,
        ];
    }
}