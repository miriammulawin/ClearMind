<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorDashboardController extends Controller
{
    /**
     * Get paginated list of patients (clients)
     */
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
                'first_name'          => $user->first_name ?? '—',
                'last_name'           => $user->last_name ?? '—',
                'dob'                 => $user->dob ?? null,
                'address'             => $user->address ?? '—',
                'sex'                 => $user->sex ?? null,
                'contact_no'          => $user->contact_no ?? '—',
                'email'                => $user->email ?? '—',
                'appointment_status'   => $client->appointment_status,
                'created_at'           => $client->created_at,
            ];
        });

        return response()->json($patients);
    }

    /**
     * Get counts for dashboard pie chart
     */
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

    /**
     * Monthly new patients (per month)
     */
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

    /**
     * Update doctor's own profile (setup)
     */
   public function setup(Request $request)
{
    $user = $request->user();

    // Decode JSON strings BEFORE validation
    $fields = ['specializations', 'sub_specializations', 'board_certificates', 'services'];
    foreach ($fields as $field) {
        $value = $request->input($field);
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $request->merge([$field => is_array($decoded) ? $decoded : []]);
        }
    }

    $request->validate([
        'professional_title'  => 'nullable|string',
        'description'         => 'nullable|string',
        'years_of_experience' => 'nullable|integer',
        'prc_number'          => 'nullable|string',
        'license_number'      => 'nullable|string',
        'main_specialization' => 'nullable|string',
        'specializations'     => 'nullable|array',
        'sub_specializations' => 'nullable|array',
        'board_certificates'  => 'nullable|array',
        'services'            => 'nullable|array',
    ]);

    // Find or create the doctor record for this user
    $doctor = \App\Models\Doctor::firstOrCreate(['user_id' => $user->id]);

    // Handle file uploads — save to doctors table, NOT users
    if ($request->hasFile('profile_picture')) {
        $doctor->profile_picture = $request->file('profile_picture')
            ->store('profiles', 'public');
    }

    if ($request->hasFile('certificate_image')) {
        $doctor->certificate_image = $request->file('certificate_image')
            ->store('certificates', 'public');
    }

    // Save doctor-specific fields to doctors table
    $doctor->fill([
        'prc_number'          => $request->prc_number,
        'professional_title'  => $request->professional_title,
        'description'         => $request->description,
        'years_of_experience' => $request->years_of_experience,
        'license_number'      => $request->license_number,
        'practicing_since'    => $request->practicing_since,
        'specializations'     => $request->specializations     ?? [],
        'sub_specializations' => $request->sub_specializations ?? [],
        'board_certificates'  => $request->board_certificates  ?? [],
        'services'            => $request->services            ?? [],
    ])->save();

    // Reload fresh data
    $doctor->refresh();

    return response()->json([
        'message' => 'Doctor profile updated successfully',
        'user' => [
            'id'                => $user->id,
            'firstName'         => $user->first_name,
            'lastName'          => $user->last_name,
            'middleInitial'     => $user->middle_initial,
            'email'             => $user->email,
            'contactNo'         => $user->contact_no,
            'dob'               => $user->dob,
            'sex'               => $user->sex,
            'prc_number'        => $doctor->prc_number,
            'description'       => $doctor->description,
            'professionalTitle' => $doctor->professional_title,
            'licenseNumber'     => $doctor->license_number,
            'main_Specialization' => $doctor->main_specialization,
            'practicingSince'   => $doctor->practicing_since,
            'specializations'   => $doctor->specializations,
            'subSpecializations'=> $doctor->sub_specializations,
            'boardCertificates' => $doctor->board_certificates,
            'services'          => $doctor->services,
            'profilePictureUrl' => $doctor->profile_picture
                ? asset('storage/' . $doctor->profile_picture)
                : null,
        ]
    ]);
}
}