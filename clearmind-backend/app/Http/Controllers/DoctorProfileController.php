<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DoctorProfileController extends Controller
{
    /* ══════════════════════════════════════════════════════
       GET /doctor/profile
       Returns the logged-in doctor's profile record
    ══════════════════════════════════════════════════════ */
    public function show(): JsonResponse
    {
        $user   = Auth::user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found.'], 404);
        }

        return response()->json([
            'data' => array_merge($doctor->toArray(), [
                'firstName'     => $user->firstName,
                'lastName'      => $user->lastName,
                'middleInitial' => $user->middleInitial,
                'email'         => $user->email,
            ]),
        ]);
    }

    /* ══════════════════════════════════════════════════════
       POST /doctor/profile/setup
       Called when the doctor fills in the Account Setup
       modal for the first time (or updates it later).

       Accepts multipart/form-data so files can be uploaded.
    ══════════════════════════════════════════════════════ */
    public function setup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            /* ── Text fields ── */
            'professional_title'   => ['nullable', 'string', 'max:255'],
            'description'          => ['nullable', 'string'],
            'years_of_experience'  => ['nullable', 'integer', 'min:0', 'max:70'],
            'license_number'       => ['nullable', 'string', 'max:255'],
            'practicing_since'     => ['nullable', 'string', 'max:10'],
            'main_specialty'       => ['nullable', 'string', 'max:255'],
            'prc_number'           => ['nullable', 'string', 'max:255'],

            /* ── JSON arrays sent as stringified JSON ── */
            'specializations'      => ['nullable', 'string'],  // JSON
            'sub_specializations'  => ['nullable', 'string'],  // JSON
            'board_cert_names'     => ['nullable', 'string'],  // JSON
            'services'             => ['nullable', 'string'],  // JSON

            /* ── Single file ── */
            'profile_picture'      => ['nullable', 'file', 'image', 'max:5120'],

            /* ── Multiple files ── */
            'board_cert_images'    => ['nullable', 'array', 'max:20'],
            'board_cert_images.*'  => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'id_pictures'          => ['nullable', 'array', 'max:20'],
            'id_pictures.*'        => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user   = Auth::user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json(['message' => 'Doctor profile not found.'], 404);
        }

        /* ── 1. Profile picture ── */
        if ($request->hasFile('profile_picture')) {
            // Delete old one if exists
            if ($doctor->profile_picture) {
                Storage::disk('public')->delete($doctor->profile_picture);
            }
            $doctor->profile_picture = $request->file('profile_picture')
                ->store('doctors/profile_pictures', 'public');
        }

        /* ── 2. Board certificate images (append to existing) ── */
        $existingCertImages = $doctor->board_cert_images ?? [];
        if ($request->hasFile('board_cert_images')) {
            foreach ($request->file('board_cert_images') as $file) {
                $existingCertImages[] = $file->store('doctors/board_certs', 'public');
            }
        }

        /* ── 3. ID pictures (append to existing) ── */
        $existingIdPics = $doctor->id_pictures ?? [];
        if ($request->hasFile('id_pictures')) {
            foreach ($request->file('id_pictures') as $file) {
                $existingIdPics[] = $file->store('doctors/id_pictures', 'public');
            }
        }

        /* ── 4. Decode JSON arrays ── */
        $decodeArray = fn($field) => $request->filled($field)
            ? json_decode($request->input($field), true) ?? []
            : null;

        /* ── 5. Update the doctor record ── */
        $doctor->fill([
            'professional_title'  => $request->professional_title  ?? $doctor->professional_title,
            'description'         => $request->description         ?? $doctor->description,
            'years_of_experience' => $request->years_of_experience ?? $doctor->years_of_experience,
            'license_number'      => $request->license_number      ?? $doctor->license_number,
            'practicing_since'    => $request->practicing_since    ?? $doctor->practicing_since,
            'main_specialty'      => $request->main_specialty      ?? $doctor->main_specialty,
            'prc_number'          => $request->prc_number          ?? $doctor->prc_number,

            'specializations'     => $decodeArray('specializations')     ?? $doctor->specializations,
            'sub_specializations' => $decodeArray('sub_specializations') ?? $doctor->sub_specializations,
            'board_cert_names'    => $decodeArray('board_cert_names')    ?? $doctor->board_cert_names,
            'services'            => $decodeArray('services')            ?? $doctor->services,

            'board_cert_images'   => $existingCertImages,
            'id_pictures'         => $existingIdPics,

            'profile_completed'    => true,
            'profile_completed_at' => now(),
        ]);

        $doctor->save();

        return response()->json([
            'message' => 'Profile setup completed.',
            'data'    => $doctor->fresh(),
        ], 200);
    }

    /* ══════════════════════════════════════════════════════
       DELETE /doctor/profile/files
       Removes a specific file from board_cert_images
       or id_pictures by its storage path.
    ══════════════════════════════════════════════════════ */
    public function deleteFile(Request $request): JsonResponse
    {
        $request->validate([
            'field' => ['required', 'in:board_cert_images,id_pictures'],
            'path'  => ['required', 'string'],
        ]);

        $user   = Auth::user();
        $doctor = Doctor::where('user_id', $user->id)->firstOrFail();

        $field   = $request->field;
        $current = $doctor->$field ?? [];

        if (!in_array($request->path, $current, true)) {
            return response()->json(['message' => 'File not found in record.'], 404);
        }

        Storage::disk('public')->delete($request->path);
        $doctor->$field = array_values(array_filter($current, fn($p) => $p !== $request->path));
        $doctor->save();

        return response()->json(['message' => 'File removed.']);
    }
}