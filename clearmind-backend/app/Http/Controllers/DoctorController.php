<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;

/**
 * DoctorController
 * All routes protected by: auth:sanctum + RoleMiddleware:Doctor
 */
class DoctorController extends Controller
{
    // ──────────────────────────────────────────────
    // GET /api/doctor/profile
    // ──────────────────────────────────────────────
    public function profile(Request $request): JsonResponse
    {
        $user   = $request->user();
        $doctor = $user->doctor;

        return response()->json([
            'data' => [
                // USER FIELDS
                'firstName'      => $user->firstName,
                'lastName'       => $user->lastName,
                'middleInitial'  => $user->middleInitial,
                'email'          => $user->email,
                'contactNo'      => $user->contactNo,
                'dob'            => $user->dob,
                'sex'            => $user->sex,
                'genderIdentity' => $user->genderIdentity,
                'address'        => $user->address,

                // DOCTOR FIELDS
                'professional_title'  => $doctor?->professional_title,
                'description'         => $doctor?->description,
                'years_of_experience' => $doctor?->years_of_experience,  // ✅ added
                'practicing_since'    => $doctor?->practicing_since,
                'profile_completed'   => $doctor?->profile_completed ?? false, // ✅ added

                // ✅ was license_number (single string) — now license_numbers (array)
                'license_numbers'     => $doctor?->license_numbers ?? [],

                'specializations'     => $doctor?->specializations     ?? [],
                'sub_specializations' => $doctor?->sub_specializations ?? [],
                'board_cert_names'    => $doctor?->board_cert_names    ?? [],

                'board_cert_images' => array_map(
                    fn($p) => $p ? asset('storage/' . $p) : null,
                    $doctor?->board_cert_images ?? []
                ),

                'id_pictures' => array_map(
                    fn($p) => $p ? asset('storage/' . $p) : null,
                    $doctor?->id_pictures ?? []
                ),

                'services' => $doctor?->services ?? [],

                // PROFILE PIC
                'profile_picture' => $doctor?->profile_picture
                    ? asset('storage/' . $doctor->profile_picture)
                    : ($user->profilePicture
                        ? asset('storage/' . $user->profilePicture)
                        : null),
            ],
        ]);
    }

    // ──────────────────────────────────────────────
    // PUT /api/doctor/profile
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

    public function updateProfilePicture(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'profilePicture' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($user->profilePicture) {
            Storage::disk('public')->delete($user->profilePicture);
        }

        $path = $request->file('profilePicture')
            ->store('profile_pictures', 'public');

        $user->profilePicture = $path;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => [
                'profilePicture' => asset('storage/' . $path),
            ],
        ]);
    }

    public function uploadDocuments(Request $request): JsonResponse
    {
        $user   = $request->user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found',
            ], 404);
        }

        $request->validate([
            'board_cert_images.*' => 'nullable|image|mimes:jpg,jpeg,png,pdf|max:4096',
            'id_pictures.*'       => 'nullable|image|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        $boardCertPaths = [];
        $idPicPaths     = [];

        if ($request->hasFile('board_cert_images')) {
            foreach ($request->file('board_cert_images') as $file) {
                $boardCertPaths[] = $file->store('doctor/board_certs', 'public');
            }
        }

        if ($request->hasFile('id_pictures')) {
            foreach ($request->file('id_pictures') as $file) {
                $idPicPaths[] = $file->store('doctor/id_pictures', 'public');
            }
        }

        $doctor->board_cert_images = array_merge($doctor->board_cert_images ?? [], $boardCertPaths);
        $doctor->id_pictures       = array_merge($doctor->id_pictures       ?? [], $idPicPaths);
        $doctor->save();

        return response()->json([
            'success' => true,
            'message' => 'Documents uploaded successfully',
            'data'    => $doctor->fresh(),
        ]);
    }

    public function updateDoctorProfile(Request $request): JsonResponse
    {
        $user   = $request->user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor profile not found.',
            ], 404);
        }

        $validated = $request->validate([
            'professional_title'  => 'sometimes|string|max:255',
            'license_numbers'     => 'sometimes|array|min:1',
            'license_numbers.*'   => 'string|digits_between:1,20',
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
            'email'            => 'sometimes|email|max:255',
            'current_password' => 'required_with:password|string',
            'password'         => ['nullable', 'confirmed', Password::min(6)],
        ]);

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

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
        ]);
    }

    // ──────────────────────────────────────────────
    // GET /api/doctor/clients
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