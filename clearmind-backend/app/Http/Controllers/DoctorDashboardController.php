<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\DoctorImage;
use App\Models\Specialization;
use App\Models\SubSpecialization;
use App\Models\BoardCertificate;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DoctorDashboardController extends Controller
{
    /**
     * Get doctor's patients paginated
     * Endpoint: GET /doctor/dashboard?page=1
     */
    public function patients(Request $request)
    {
        try {
            $page    = $request->query('page', 1);
            $perPage = 10;

            $doctorUser = auth()->user();

            if (!$doctorUser || $doctorUser->role !== 'Doctor') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $doctor = $doctorUser->doctor;

            if (!$doctor) {
                return response()->json(['error' => 'Doctor profile not found'], 404);
            }

            $patients = Client::where('doctor_id', $doctor->id)
                ->with(['user', 'appointments' => function ($q) {
                    $q->latest('appointment_date')->limit(1);
                }])
                ->paginate($perPage, ['*'], 'page', $page);

            $formattedData = collect($patients->items())->map(function ($client) {
                $latestAppointment = $client->appointments->first();
                return [
                    'id'                 => $client->id,
                    'first_name'         => $client->user->first_name,
                    'last_name'          => $client->user->last_name,
                    'email'              => $client->user->email,
                    'contact_no'         => $client->user->contact_no,
                    'sex'                => $client->user->sex,
                    'dob'                => $client->user->dob,
                    'appointment_status' => $latestAppointment?->status ?? $client->appointment_status,
                    'created_at'         => $client->created_at,
                ];
            });

            return response()->json([
                'data'         => $formattedData,
                'total'        => $patients->total(),
                'current_page' => $patients->currentPage(),
                'last_page'    => $patients->lastPage(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to fetch dashboard data',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get appointment status counts
     * Endpoint: GET /doctor/status-counts
     */
    public function statusCounts()
    {
        try {
            $doctorUser = auth()->user();

            if (!$doctorUser || $doctorUser->role !== 'Doctor') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $doctor = $doctorUser->doctor;

            if (!$doctor) {
                return response()->json(['error' => 'Doctor profile not found'], 404);
            }

            $base = Appointment::whereHas('client', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            });

            return response()->json([
                'Scheduled' => (clone $base)->where('status', 'Scheduled')->count(),
                'Completed' => (clone $base)->where('status', 'Completed')->count(),
                'Cancelled' => (clone $base)->where('status', 'Cancelled')->count(),
                'Pending'   => (clone $base)->where('status', 'Pending')->count(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to fetch status counts',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get monthly appointment counts
     * Endpoint: GET /doctor/monthly-patients
     */
    public function monthlyPatients()
    {
        try {
            $doctorUser = auth()->user();

            if (!$doctorUser || $doctorUser->role !== 'Doctor') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $doctor = $doctorUser->doctor;

            if (!$doctor) {
                return response()->json(['error' => 'Doctor profile not found'], 404);
            }

            $currentYear = Carbon::now()->year;
            $monthlyData = [];

            for ($month = 1; $month <= 12; $month++) {
                $start = Carbon::createFromDate($currentYear, $month, 1)->startOfMonth()->toDateString();
                $end   = Carbon::createFromDate($currentYear, $month, 1)->endOfMonth()->toDateString();

                $monthlyData[] = Appointment::whereHas('client', function ($q) use ($doctor) {
                    $q->where('doctor_id', $doctor->id);
                })
                ->whereBetween('appointment_date', [$start, $end])
                ->count();
            }

            return response()->json($monthlyData, 200);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to fetch monthly patients',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get today's online vs physical appointment counts
     * Endpoint: GET /doctor/today-appointments-count?date=YYYY-MM-DD
     */
    public function todayAppointmentsCount(Request $request)
    {
        try {
            $date = $request->query('date');

            if (!$date) {
                $date = Carbon::now()->toDateString();
            } else {
                try {
                    $date = Carbon::createFromFormat('Y-m-d', $date)->toDateString();
                } catch (\Exception $e) {
                    return response()->json(['error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
                }
            }

            $doctorUser = auth()->user();

            if (!$doctorUser || $doctorUser->role !== 'Doctor') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $doctor = $doctorUser->doctor;

            if (!$doctor) {
                return response()->json(['error' => 'Doctor profile not found'], 404);
            }

            $appointments = Appointment::whereHas('client', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })
            ->whereDate('appointment_date', $date)
            ->get();

            return response()->json([
                'success'  => true,
                'date'     => $date,
                'online'   => $appointments->where('visit_type', 'Online')->count(),
                'physical' => $appointments->where('visit_type', 'Physical')->count(),
                'total'    => $appointments->count(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Failed to fetch today\'s appointment counts',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Setup / update doctor profile
     * Endpoint: POST /doctor/setup
     */
    public function setup(Request $request)
    {
        try {
            $doctorUser = auth()->user();

            if (!$doctorUser || $doctorUser->role !== 'Doctor') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $doctor = $doctorUser->doctor;

            if (!$doctor) {
                return response()->json(['error' => 'Doctor profile not found'], 404);
            }

            // ── Validate ──────────────────────────────────────────
            $request->validate([
                'professional_title'   => 'required|string|max:255',
                'prc_number'           => 'required|string|max:100',
                'profile_picture'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
                'certificate_images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
                'id_pictures.*'        => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            ]);

            // ── 1. Profile picture ────────────────────────────────
            $profilePicturePath = $doctor->profile_picture;

            if ($request->hasFile('profile_picture')) {
                if ($profilePicturePath && Storage::disk('public')->exists($profilePicturePath)) {
                    Storage::disk('public')->delete($profilePicturePath);
                }
                $profilePicturePath = $request->file('profile_picture')
                    ->store('profile_pictures', 'public');
            }

            // ── 2. Certificate images → saved as individual rows ──
            if ($request->hasFile('certificate_images')) {
                foreach ($request->file('certificate_images') as $file) {
                    $path = $file->store('certificate_images', 'public');
                    DoctorImage::create([
                        'doctor_id' => $doctor->id,
                        'type'      => 'certificate',
                        'path'      => $path,
                    ]);
                }
            }

            // ── 3. ID pictures → saved as individual rows ─────────
            if ($request->hasFile('id_pictures')) {
                foreach ($request->file('id_pictures') as $file) {
                    $path = $file->store('id_pictures', 'public');
                    DoctorImage::create([
                        'doctor_id' => $doctor->id,
                        'type'      => 'id_picture',
                        'path'      => $path,
                    ]);
                }
            }

            // ── 4. Update doctor basic info ───────────────────────
            $doctor->update([
                'profile_picture'     => $profilePicturePath,
                'description'         => $request->input('description', ''),
                'professional_title'  => $request->input('professional_title'),
                'years_of_experience' => $request->input('years_of_experience') ?: null,
                'practicing_since'    => $request->input('practicing_since', ''),
                'prc_number'          => $request->input('prc_number'),
                'license_number'      => $request->input('license_number', ''),
            ]);

            // ── 5. Sync specializations ───────────────────────────
            $mainSpecialties     = json_decode($request->input('main_specialties',  '[]'), true) ?? [];
            $specializationNames = json_decode($request->input('specializations',   '[]'), true) ?? [];

            $specializationSync = [];
            foreach ($specializationNames as $name) {
                $spec = Specialization::where('name', $name)->first();
                if ($spec) {
                    $specializationSync[$spec->id] = ['is_main' => in_array($name, $mainSpecialties)];
                }
            }
            foreach ($mainSpecialties as $name) {
                $spec = Specialization::where('name', $name)->first();
                if ($spec && !isset($specializationSync[$spec->id])) {
                    $specializationSync[$spec->id] = ['is_main' => true];
                }
            }
            $doctor->specializations()->sync($specializationSync);

            // ── 6. Sync sub-specializations ───────────────────────
            $subSpecNames = json_decode($request->input('sub_specializations', '[]'), true) ?? [];
            $subSpecIds   = SubSpecialization::whereIn('name', $subSpecNames)->pluck('id')->toArray();
            $doctor->subSpecializations()->sync($subSpecIds);

            // ── 7. Sync board certificates ────────────────────────
            $certNames = json_decode($request->input('board_certificates', '[]'), true) ?? [];
            $certSync  = [];
            foreach ($certNames as $name) {
                $cert = BoardCertificate::where('name', $name)->first();
                if ($cert) {
                    $existing = $doctor->boardCertificates()
                        ->where('board_certificate_id', $cert->id)
                        ->first();
                    $certSync[$cert->id] = [
                        'certificate_number' => $existing?->pivot?->certificate_number ?? 'PENDING',
                        'issued_date'        => $existing?->pivot?->issued_date        ?? now()->toDateString(),
                        'expiry_date'        => $existing?->pivot?->expiry_date        ?? now()->addYears(3)->toDateString(),
                    ];
                }
            }
            $doctor->boardCertificates()->sync($certSync);

            // ── 8. Sync services ──────────────────────────────────
            $serviceNames = json_decode($request->input('services', '[]'), true) ?? [];
            $serviceIds   = Service::whereIn('name', $serviceNames)->pluck('id')->toArray();
            $doctor->services()->sync($serviceIds);

            // ── 9. Build response with full URLs ──────────────────
            $doctor->load([
                'specializations',
                'subSpecializations',
                'boardCertificates',
                'services',
                'certificateImages',
                'idPictures',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile setup complete!',
                'user'    => [
                    'id'                => $doctorUser->id,
                    'firstName'         => $doctorUser->first_name,
                    'lastName'          => $doctorUser->last_name,
                    'first_name'        => $doctorUser->first_name,
                    'last_name'         => $doctorUser->last_name,
                    'email'             => $doctorUser->email,
                    'role'              => $doctorUser->role,
                    'prcNumber'         => $doctor->prc_number,
                    'prc_number'        => $doctor->prc_number,
                    'licenseNumber'     => $doctor->license_number,
                    'professionalTitle' => $doctor->professional_title,
                    'profilePictureUrl' => $doctor->profile_picture ? asset('storage/' . $doctor->profile_picture) : null,
                ],
                'profile' => [
                    'profile_picture'     => $doctor->profile_picture
                        ? asset('storage/' . $doctor->profile_picture)
                        : null,
                    'description'         => $doctor->description,
                    'professional_title'  => $doctor->professional_title,
                    'years_of_experience' => $doctor->years_of_experience,
                    'practicing_since'    => $doctor->practicing_since,
                    'prc_number'          => $doctor->prc_number,
                    'license_number'      => $doctor->license_number,
                    'specializations'     => $doctor->specializations,
                    'sub_specializations' => $doctor->subSpecializations,
                    'board_certificates'  => $doctor->boardCertificates,
                    'services'            => $doctor->services,
                    // Each image is now its own DB row — clean and scalable
                    'certificate_images'  => $doctor->certificateImages
                        ->map(fn($img) => asset('storage/' . $img->path))
                        ->values(),
                    'id_pictures'         => $doctor->idPictures
                        ->map(fn($img) => asset('storage/' . $img->path))
                        ->values(),
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Setup failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}