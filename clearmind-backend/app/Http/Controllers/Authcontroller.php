<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // ── REGISTER ───────────────────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => ['required', 'string', 'max:100'],
            'lastName'  => ['required', 'string', 'max:100'],
            'dob'       => ['required', 'date', 'before:today'],
            'sex'       => ['required', 'in:male,female'],
            'contactNo' => ['required', 'string', 'max:20'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'  => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = User::create([
            'first_name' => $validated['firstName'],
            'last_name'  => $validated['lastName'],
            'dob'        => $validated['dob'],
            'sex'        => $validated['sex'],
            'contact_no' => $validated['contactNo'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => 'Client',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data'    => [
                'user'       => $this->formatUser($user),
                'token'      => $token,
                'token_type' => 'Bearer',
                'role'       => $user->role,
            ],
        ], 201);
    }

    // ── LOGIN ──────────────────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        // Revoke all previous tokens (single-session)
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'token'      => $token,
                'token_type' => 'Bearer',
                'role'       => $user->role,
                // Full user with ALL profile fields — frontend stores this in
                // localStorage so everything is restored on every login
                'user'       => $this->formatUser($user),
            ],
        ], 200);
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }

    // ── GET PROFILE ───────────────────────────────────────────────────────
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->formatUser($request->user()),
        ], 200);
    }

    // ── UPDATE PROFILE ────────────────────────────────────────────────────
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'firstName' => ['sometimes', 'string', 'max:100'],
            'lastName'  => ['sometimes', 'string', 'max:100'],
            'dob'       => ['sometimes', 'date', 'before:today'],
            'sex'       => ['sometimes', 'in:male,female'],
            'contactNo' => ['sometimes', 'string', 'max:20'],
            'email'     => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update([
            'first_name' => $validated['firstName'] ?? $user->first_name,
            'last_name'  => $validated['lastName']  ?? $user->last_name,
            'dob'        => $validated['dob']        ?? $user->dob,
            'sex'        => $validated['sex']        ?? $user->sex,
            'contact_no' => $validated['contactNo']  ?? $user->contact_no,
            'email'      => $validated['email']      ?? $user->email,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => $this->formatUser($user->fresh()),
        ], 200);
    }

    // ── CHANGE PASSWORD ───────────────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ], 200);
    }

    // ── HELPER: format user for all JSON responses ─────────────────────────
    // This now includes ALL doctor profile fields so the frontend can restore
    // everything from localStorage after every login — no extra API calls needed.
    private function formatUser(User $user): array
    {
        return [
            // ── Core fields ───────────────────────────────────────────
            'id'          => $user->id,
            'firstName'   => $user->first_name,
            'lastName'    => $user->last_name,
            'fullName'    => $user->full_name,
            'dob'         => $user->dob?->format('Y-m-d'),
            'sex'         => $user->sex,
            'contactNo'   => $user->contact_no,
            'email'       => $user->email,
            'role'        => $user->role,
            'isActive'    => $user->is_active,
            'createdAt'   => $user->created_at?->toDateTimeString(),
            'prcNumber'   => $user->prc_number ?? $user->license_number,

            // ── Doctor profile fields ─────────────────────────────────
            'professionalTitle'  => $user->professional_title,
            'credentials'        => $user->professional_title, // alias used by frontend
            'description'        => $user->description,
            'yearsOfExperience'  => $user->years_of_experience,
            'licenseNumber'      => $user->license_number,
            'practicingSince'    => $user->practicing_since,

            // ── JSON array fields (model casts these to arrays already) ─
            'specializations'    => $user->specializations    ?? [],
            'subSpecializations' => $user->sub_specializations ?? [],
            'boardCertificates'  => $user->board_certificates  ?? [],
            'services'           => $user->services            ?? [],

            // Convenience: first specialization as "specialty" string
            'specialty'          => ($user->specializations[0] ?? null),

            // ── Image URLs (full public URLs, served by Laravel storage) ─
            'profilePictureUrl'  => $user->profile_picture_url,
            'certificateImageUrl'=> $user->certificate_image_url,
        ];
    }
}