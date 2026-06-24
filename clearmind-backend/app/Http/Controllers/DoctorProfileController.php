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


public function setup(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'professional_title'   => ['nullable', 'string', 'max:255'],
        'description'          => ['nullable', 'string'],
        'years_of_experience'  => ['nullable', 'integer', 'min:0', 'max:70'],

        // Multiple License Numbers
        'license_numbers'      => ['nullable', 'string'],

        'practicing_since'     => ['nullable', 'string', 'max:10'],
        'main_specialty'       => ['nullable', 'string', 'max:255'],

        'specializations'      => ['nullable', 'string'],
        'sub_specializations'  => ['nullable', 'string'],
        'board_cert_names'     => ['nullable', 'string'],
        'services'             => ['nullable', 'string'],

        'profile_picture'      => ['nullable', 'file', 'image', 'max:5120'],

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

    $user = Auth::user();

    $doctor = Doctor::where('user_id', $user->id)->first();

    if (!$doctor) {
        return response()->json([
            'message' => 'Doctor profile not found.'
        ], 404);
    }

    // Profile Picture
    if ($request->hasFile('profile_picture')) {

        if ($doctor->profile_picture) {
            Storage::disk('public')->delete($doctor->profile_picture);
        }

        $doctor->profile_picture = $request
            ->file('profile_picture')
            ->store('doctors/profile_pictures', 'public');
    }

    // Board Certificate Images
    $existingCertImages = $doctor->board_cert_images ?? [];

    if ($request->hasFile('board_cert_images')) {
        foreach ($request->file('board_cert_images') as $file) {
            $existingCertImages[] = $file->store(
                'doctors/board_certs',
                'public'
            );
        }
    }

    // ID Pictures
    $existingIdPics = $doctor->id_pictures ?? [];

    if ($request->hasFile('id_pictures')) {
        foreach ($request->file('id_pictures') as $file) {
            $existingIdPics[] = $file->store(
                'doctors/id_pictures',
                'public'
            );
        }
    }

    // Decode JSON fields
    $decodeArray = function ($field) use ($request) {
        if (!$request->filled($field)) {
            return null;
        }

        return json_decode($request->input($field), true) ?? [];
    };

    // Decode License Numbers
    $licenseNumbers = $decodeArray('license_numbers');

    $doctor->fill([
        'professional_title'  => $request->professional_title ?? $doctor->professional_title,
        'description'         => $request->description ?? $doctor->description,
        'years_of_experience' => $request->years_of_experience ?? $doctor->years_of_experience,

        // SAVE MULTIPLE LICENSE NUMBERS
        'license_numbers'     => $licenseNumbers ?? $doctor->license_numbers,

        'practicing_since'    => $request->practicing_since ?? $doctor->practicing_since,
        'main_specialty'      => $request->main_specialty ?? $doctor->main_specialty,

        'specializations'     => $decodeArray('specializations') ?? $doctor->specializations,
        'sub_specializations' => $decodeArray('sub_specializations') ?? $doctor->sub_specializations,
        'board_cert_names'    => $decodeArray('board_cert_names') ?? $doctor->board_cert_names,
        'services'            => $decodeArray('services') ?? $doctor->services,

        'board_cert_images'   => $existingCertImages,
        'id_pictures'         => $existingIdPics,

        'profile_completed'   => true,
        'profile_completed_at'=> now(),
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