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
                'services'            => $doctor?->services            ?? [],

                // FIX: board_cert_images already stored as relative paths — return full URLs
                'board_cert_images' => array_values(array_map(
                    fn($p) => $p ? asset('storage/' . $p) : null,
                    $doctor?->board_cert_images ?? []
                )),

                'id_pictures' => array_values(array_map(
                    fn($p) => $p ? asset('storage/' . $p) : null,
                    $doctor?->id_pictures ?? []
                )),

                // Profile picture: prefer doctor record, fall back to user record
                'profile_picture' => $doctor?->profile_picture
                    ? asset('storage/' . $doctor->profile_picture)
                    : ($user->profilePicture
                        ? asset('storage/' . $user->profilePicture)
                        : null),
            ],
        ]);
    }

    // ──────────────────────────────────────────────
    // POST /api/doctor/profile/setup
    // Unified endpoint — saves all steps in one shot
    // Called by the frontend's handleUpload() on the docs step
    // ──────────────────────────────────────────────
    public function setupProfile(Request $request): JsonResponse
    {
        $user   = $request->user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor record not found.',
            ], 404);
        }

        $request->validate([
            'professional_title'  => 'required|string|max:255',
            'description'         => 'nullable|string',
            'years_of_experience' => 'nullable|integer|min:0|max:70',
            'practicing_since'    => 'nullable|string|max:10',

            // Sent as JSON-encoded strings from FormData
            'license_numbers'     => 'nullable|string',
            'specializations'     => 'nullable|string',
            'sub_specializations' => 'nullable|string',
            'board_cert_names'    => 'nullable|string',
            'services'            => 'nullable|string',

            'profile_picture'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'board_cert_images.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
            'id_pictures.*'       => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        // ── Text / JSON fields ──────────────────────
        $doctor->professional_title  = $request->input('professional_title');
        $doctor->description         = $request->input('description');
        $doctor->years_of_experience = $request->input('years_of_experience');
        $doctor->practicing_since    = $request->input('practicing_since');

        // Decode JSON arrays (frontend sends them via FormData as JSON strings)
      $doctor->license_numbers = json_decode(
    $request->input('license_numbers', '[]'),
    true
) ?? [];
        $doctor->specializations     = json_decode($request->input('specializations',     '[]'), true) ?? [];
        $doctor->sub_specializations = json_decode($request->input('sub_specializations', '[]'), true) ?? [];
        $doctor->board_cert_names    = json_decode($request->input('board_cert_names',    '[]'), true) ?? [];
        $doctor->services            = json_decode($request->input('services',            '[]'), true) ?? [];

        // ── Profile picture ─────────────────────────
        if ($request->hasFile('profile_picture')) {
            // Delete old file if it exists
            if ($doctor->profile_picture) {
                Storage::disk('public')->delete($doctor->profile_picture);
            }
            $doctor->profile_picture = $request->file('profile_picture')
                ->store('doctor/profile_pictures', 'public');
        }

        // ── Board certificate images (append to existing) ──
        if ($request->hasFile('board_cert_images')) {
            $new = [];
            foreach ($request->file('board_cert_images') as $file) {
                $new[] = $file->store('doctor/board_certs', 'public');
            }
            $doctor->board_cert_images = array_values(
                array_merge($doctor->board_cert_images ?? [], $new)
            );
        }

        // ── ID pictures (append to existing) ────────
        if ($request->hasFile('id_pictures')) {
            $new = [];
            foreach ($request->file('id_pictures') as $file) {
                $new[] = $file->store('doctor/id_pictures', 'public');
            }
            $doctor->id_pictures = array_values(
                array_merge($doctor->id_pictures ?? [], $new)
            );
        }

        // ── Mark profile as complete (only once) ────
        if (!$doctor->profile_completed) {
            $doctor->profile_completed    = true;
            $doctor->profile_completed_at = now();
        }

        $doctor->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile saved successfully.',
        ]);
    }

    // ──────────────────────────────────────────────
    // DELETE /api/doctor/profile/files
    // Remove a single file from board_cert_images or id_pictures
    // Body: { field: "board_cert_images"|"id_pictures", path: "<full URL>" }
    // ──────────────────────────────────────────────
    public function removeFile(Request $request): JsonResponse
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return response()->json(['success' => false, 'message' => 'Doctor not found.'], 404);
        }

        $request->validate([
            'field' => 'required|in:board_cert_images,id_pictures',
            'path'  => 'required|string',
        ]);

        $field = $request->input('field');
        $path  = $request->input('path');

        // Frontend sends the full URL (e.g. http://localhost:8000/storage/doctor/…)
        // Strip it down to the storage-relative path
        $storagePath = ltrim(str_replace(asset('storage'), '', $path), '/');

        // Delete physical file
        Storage::disk('public')->delete($storagePath);

        // Remove from the array and re-index
        $current          = $doctor->{$field} ?? [];
        $doctor->{$field} = array_values(
            array_filter($current, fn($p) => $p !== $storagePath)
        );
        $doctor->save();

        return response()->json(['success' => true, 'message' => 'File removed.']);
    }

    // ──────────────────────────────────────────────
    // PUT /api/doctor/profile
    // Update basic user fields (name, contact, address)
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
    // POST /api/doctor/profile/picture
    // Standalone profile picture update (outside of setup)
    // ──────────────────────────────────────────────
    public function updateProfilePicture(Request $request): JsonResponse
    {
        $user   = $request->user();
        $doctor = $user->doctor;

        $request->validate([
            'profilePicture' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Save to doctor record (consistent with setupProfile)
        if ($doctor) {
            if ($doctor->profile_picture) {
                Storage::disk('public')->delete($doctor->profile_picture);
            }
            $path                    = $request->file('profilePicture')->store('doctor/profile_pictures', 'public');
            $doctor->profile_picture = $path;
            $doctor->save();
        } else {
            // Fallback: save to user record if no doctor record exists yet
            if ($user->profilePicture) {
                Storage::disk('public')->delete($user->profilePicture);
            }
            $path              = $request->file('profilePicture')->store('profile_pictures', 'public');
            $user->profilePicture = $path;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'data'    => ['profilePicture' => asset('storage/' . $path)],
        ]);
    }

    // ──────────────────────────────────────────────
    // PUT /api/doctor/change-password
    // ──────────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
                // FIX: return as errors object so frontend setPwErrors() works
                'errors'  => ['current_password' => ['Current password is incorrect.']],
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