<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Models\Specialization;
use App\Models\SubSpecialization;
use App\Models\Service;
use App\Models\BoardCertificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DoctorDashboardController extends Controller
{
    public function patients()
    {
        $patients = Client::query()
            ->with(['user' => function ($q) {
                $q->select('id', 'first_name', 'last_name', 'dob', 'sex', 'contact_no', 'email', 'created_at');
            }])
            ->select('id', 'user_id', 'appointment_status', 'created_at')
            ->latest('created_at')
            ->paginate(10);

        $patients->getCollection()->transform(function ($client) {
            $user = $client->user ?? (object) [];
            return [
                'id'                 => $user->id ?? null,
                'first_name'         => $user->first_name ?? '—',
                'last_name'          => $user->last_name ?? '—',
                'dob'                => $user->dob ?? null,
                'address'            => $user->address ?? '—',
                'sex'                => $user->sex ?? null,
                'contact_no'         => $user->contact_no ?? '—',
                'email'              => $user->email ?? '—',
                'appointment_status' => $client->appointment_status,
                'created_at'         => $client->created_at,
            ];
        });

        return response()->json($patients);
    }

    public function statusCounts()
    {
        $counts = Client::selectRaw("
            SUM(CASE WHEN appointment_status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN appointment_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN appointment_status = 'Pending'   THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN appointment_status = 'Completed' THEN 1 ELSE 0 END) as completed
        ")->first();

        return response()->json([
            'Scheduled' => (int) $counts->scheduled,
            'Cancelled' => (int) $counts->cancelled,
            'Pending'   => (int) $counts->pending,
            'Completed' => (int) $counts->completed,
        ]);
    }

    public function monthlyPatients()
    {
        $monthly = User::where('role', 'Client')
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $data = [];
        for ($m = 1; $m <= 12; $m++) {
            $data[] = $monthly[$m]->count ?? 0;
        }

        return response()->json($data);
    }

    // ── Helper: build full profile response ─────────────────────────────────
    private function buildProfileResponse($user, $doctor)
    {
        // ── Specializations via pivot ──────────────────────────────────────
        $specializations = $doctor->specializations()
            ->get()
            ->map(fn($s) => [
                'id'    => $s->id,
                'name'  => $s->name,
                'pivot' => ['is_main' => (bool) $s->pivot->is_main],
            ]);

        // ── Sub-specializations via pivot ──────────────────────────────────
        $subSpecializations = $doctor->subSpecializations()
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'name' => $s->name]);

        // ── Board certificates via pivot ───────────────────────────────────
        $boardCertificates = $doctor->boardCertificates()
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);

        // ── Services via pivot ─────────────────────────────────────────────
        $services = $doctor->services()
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'name' => $s->name]);

        // ── Certificate images (array) ─────────────────────────────────────
        $certificateImages = [];
        if (!empty($doctor->certificate_images)) {
            $raw = is_array($doctor->certificate_images)
                ? $doctor->certificate_images
                : json_decode($doctor->certificate_images, true) ?? [];
            $certificateImages = array_map(fn($p) => asset('storage/' . $p), $raw);
        }

        // ── ID pictures (array) ───────────────────────────────────────────
        $idPictures = [];
        if (!empty($doctor->id_pictures)) {
            $raw = is_array($doctor->id_pictures)
                ? $doctor->id_pictures
                : json_decode($doctor->id_pictures, true) ?? [];
            $idPictures = array_map(fn($p) => asset('storage/' . $p), $raw);
        }

        return [
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
        ];
    }

    // ── Setup / Update doctor profile ────────────────────────────────────────
    public function setup(Request $request)
    {
        $user = $request->user();

        // Decode JSON strings sent from FormData
        $jsonFields = [
            'main_specialties', 'specializations', 'sub_specializations',
            'board_certificates', 'services',
        ];
        foreach ($jsonFields as $field) {
            $value = $request->input($field);
            if (is_string($value)) {
                $decoded = json_decode($value, true);
                $request->merge([$field => is_array($decoded) ? $decoded : []]);
            }
        }

        $request->validate([
            'professional_title'  => 'nullable|string|max:255',
            'description'         => 'nullable|string',
            'years_of_experience' => 'nullable|integer|min:0|max:70',
            'prc_number'          => 'nullable|string|max:50',
            'license_number'      => 'nullable|string|max:50',
            'practicing_since'    => 'nullable|string|max:10',
            'profile_picture'     => 'nullable|image|max:5120',
            'certificate_images'  => 'nullable|array',
            'certificate_images.*'=> 'image|max:5120',
            'id_pictures'         => 'nullable|array',
            'id_pictures.*'       => 'image|max:5120',
            'main_specialties'    => 'nullable|array',
            'specializations'     => 'nullable|array',
            'sub_specializations' => 'nullable|array',
            'board_certificates'  => 'nullable|array',
            'services'            => 'nullable|array',
        ]);

        $doctor = \App\Models\Doctor::firstOrCreate(['user_id' => $user->id]);

        // ── Profile picture ────────────────────────────────────────────────
        if ($request->hasFile('profile_picture')) {
            if ($doctor->profile_picture) {
                Storage::disk('public')->delete($doctor->profile_picture);
            }
            $doctor->profile_picture = $request->file('profile_picture')
                ->store('profiles', 'public');
        }

        // ── Certificate images (append new ones, keep existing) ───────────
        $existingCerts = [];
        if (!empty($doctor->certificate_images)) {
            $existingCerts = is_array($doctor->certificate_images)
                ? $doctor->certificate_images
                : json_decode($doctor->certificate_images, true) ?? [];
        }
        if ($request->hasFile('certificate_images')) {
            foreach ($request->file('certificate_images') as $file) {
                $existingCerts[] = $file->store('certificates', 'public');
            }
        }
        $doctor->certificate_images = $existingCerts;

        // ── ID pictures (append new ones, keep existing) ──────────────────
        $existingIds = [];
        if (!empty($doctor->id_pictures)) {
            $existingIds = is_array($doctor->id_pictures)
                ? $doctor->id_pictures
                : json_decode($doctor->id_pictures, true) ?? [];
        }
        if ($request->hasFile('id_pictures')) {
            foreach ($request->file('id_pictures') as $file) {
                $existingIds[] = $file->store('id_pictures', 'public');
            }
        }
        $doctor->id_pictures = $existingIds;

        // ── Scalar fields ──────────────────────────────────────────────────
        $doctor->fill([
            'prc_number'          => $request->prc_number,
            'professional_title'  => $request->professional_title,
            'description'         => $request->description,
            'years_of_experience' => $request->years_of_experience,
            'license_number'      => $request->license_number,
            'practicing_since'    => $request->practicing_since,
        ])->save();

        // ── Pivot: Specializations ─────────────────────────────────────────
        // main_specialties = names that should have is_main = true
        $mainNames         = $request->input('main_specialties', []);
        $specializationNames = $request->input('specializations', []);
        $allNames          = array_unique(array_merge($mainNames, $specializationNames));

        $syncData = [];
        foreach ($allNames as $name) {
            // firstOrCreate so custom names also get stored
            $spec = Specialization::firstOrCreate(['name' => $name], ['description' => '']);
            $syncData[$spec->id] = ['is_main' => in_array($name, $mainNames) ? 1 : 0];
        }
        $doctor->specializations()->sync($syncData);

        // ── Pivot: Sub-specializations ─────────────────────────────────────
        $subIds = [];
        foreach ($request->input('sub_specializations', []) as $name) {
            $sub = SubSpecialization::firstOrCreate(['name' => $name], ['description' => '']);
            $subIds[] = $sub->id;
        }
        $doctor->subSpecializations()->sync($subIds);

        // ── Pivot: Board certificates ──────────────────────────────────────
        $certIds = [];
        foreach ($request->input('board_certificates', []) as $name) {
            $cert = BoardCertificate::firstOrCreate(['name' => $name], ['description' => '']);
            $certIds[] = $cert->id;
        }
        $doctor->boardCertificates()->sync($certIds);

        // ── Pivot: Services ────────────────────────────────────────────────
        $serviceIds = [];
        foreach ($request->input('services', []) as $name) {
            $svc = Service::firstOrCreate(['name' => $name], ['description' => '']);
            $serviceIds[] = $svc->id;
        }
        $doctor->services()->sync($serviceIds);

        $doctor->refresh();

        return response()->json(
            array_merge(
                ['message' => 'Doctor profile updated successfully'],
                $this->buildProfileResponse($user, $doctor)
            )
        );
    }

    // ── Update profile (PUT /doctor/profile) ─────────────────────────────────
    public function updateProfile(Request $request)
    {
        return $this->setup($request);
    }
}