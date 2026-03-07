<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Specialization;
use App\Models\SubSpecialization;
use App\Models\Service;
use App\Models\BoardCertificate;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user   = $request->user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json([
                'user' => [
                    'id'            => $user->id,
                    'firstName'     => $user->first_name,
                    'lastName'      => $user->last_name,
                    'middleInitial' => $user->middle_initial ?? '',
                    'email'         => $user->email,
                    'address'       => $user->address ?? '',
                    'contactNo'     => $user->contact_no,
                    'dob'           => $user->dob,
                    'sex'           => $user->sex,
                    'role'          => $user->role,
                ],
                'profile' => (object)[],
            ]);
        }

        // ── Specializations with pivot ─────────────────────────────────────
        $specializations = $doctor->specializations()
            ->get()
            ->map(fn($s) => [
                'id'    => $s->id,
                'name'  => $s->name,
                'pivot' => ['is_main' => (bool) $s->pivot->is_main],
            ]);

        // ── Sub-specializations ────────────────────────────────────────────
        $subSpecializations = $doctor->subSpecializations()
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'name' => $s->name]);

        // ── Board certificates ─────────────────────────────────────────────
        $boardCertificates = $doctor->boardCertificates()
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);

        // ── Services ──────────────────────────────────────────────────────
        $services = $doctor->services()
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'name' => $s->name]);

        // ── Certificate images array ───────────────────────────────────────
        $certificateImages = [];
        if (!empty($doctor->certificate_images)) {
            $raw = is_array($doctor->certificate_images)
                ? $doctor->certificate_images
                : json_decode($doctor->certificate_images, true) ?? [];
            $certificateImages = array_map(fn($p) => asset('storage/' . $p), $raw);
        }

        // ── ID pictures array ──────────────────────────────────────────────
        $idPictures = [];
        if (!empty($doctor->id_pictures)) {
            $raw = is_array($doctor->id_pictures)
                ? $doctor->id_pictures
                : json_decode($doctor->id_pictures, true) ?? [];
            $idPictures = array_map(fn($p) => asset('storage/' . $p), $raw);
        }

        return response()->json([
            'user' => [
                'id'            => $user->id,
                'firstName'     => $user->first_name,
                'lastName'      => $user->last_name,
                'middleInitial' => $user->middle_initial ?? '',
                'email'         => $user->email,
                'address'       => $user->address ?? '',
                'contactNo'     => $user->contact_no,
                'dob'           => $user->dob,
                'sex'           => $user->sex,
                'role'          => $user->role,
            ],
            'profile' => [
                'professional_title'  => $doctor->professional_title,
                'description'         => $doctor->description,
                'years_of_experience' => $doctor->years_of_experience,
                'license_number'      => $doctor->license_number,
                'prc_number'          => $doctor->prc_number,
                'practicing_since'    => $doctor->practicing_since,
                'profile_picture'     => $doctor->profile_picture
                    ? asset('storage/' . $doctor->profile_picture)
                    : null,
                'specializations'     => $specializations,
                'sub_specializations' => $subSpecializations,
                'board_certificates'  => $boardCertificates,
                'services'            => $services,
                'certificate_images'  => $certificateImages,
                'id_pictures'         => $idPictures,
            ],
        ]);
    }

    public function lookup()
    {
        return response()->json([
            'specializations'     => Specialization::select('id', 'name')->orderBy('name')->get(),
            'sub_specializations' => SubSpecialization::select('id', 'name')->orderBy('name')->get(),
            'board_certificates'  => BoardCertificate::select('id', 'name')->orderBy('name')->get(),
            'services'            => Service::select('id', 'name')->orderBy('name')->get(),
        ]);
        
    }
}