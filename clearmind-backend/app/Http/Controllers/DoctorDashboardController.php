<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;

class DoctorDashboardController extends Controller
{
 public function patients()
{
    $patients = User::where('role', 'Client')
                ->select('id', 'first_name', 'last_name', 'dob', 'sex',
                         'contact_no', 'email', 'appointment_status', 'created_at')
                ->latest()
                ->paginate(10);

    return response()->json($patients);
}

// public function patientsList()
// {
//     $patients = User::where('role', 'Client')
//                 ->select('id', 'first_name', 'last_name', 'dob', 'sex',
//                         'contact_no', 'email', 'appointment_status', 'created_at')
//                 ->latest()
//                 ->paginate(10);

//     return response()->json($patients);
// }

// New endpoint for pie chart counts
public function statusCounts()
{
    $scheduled = User::where('role', 'Client')->where('appointment_status', 'Scheduled')->count();
    $cancelled = User::where('role', 'Client')->where('appointment_status', 'Cancelled')->count();
    $pending   = User::where('role', 'Client')->where('appointment_status', 'Pending')->count();

    return response()->json([
        'Scheduled' => $scheduled,
        'Cancelled' => $cancelled,
        'Pending'   => $pending,
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
        $data[] = isset($monthly[$m]) ? (int) $monthly[$m]->count : 0;
    }

    return response()->json($data);
}

public function setup(Request $request)
{
    $user = $request->user();

    // Always decode safely (even if null)
    $request->merge([
        'specializations'     => $request->specializations 
            ? json_decode($request->specializations, true) : [],
        'sub_specializations' => $request->sub_specializations 
            ? json_decode($request->sub_specializations, true) : [],
        'board_certificates'  => $request->board_certificates 
            ? json_decode($request->board_certificates, true) : [],
        'services'            => $request->services 
            ? json_decode($request->services, true) : [],
    ]);

    $request->validate([
        'professional_title'  => 'nullable|string',
        'description'         => 'nullable|string',
        'years_of_experience' => 'nullable|integer',
        'license_number'      => 'nullable|string',
        'specializations'     => 'array',
        'sub_specializations' => 'array',
        'board_certificates'  => 'array',
        'services'            => 'array',
    ]);

    if ($request->hasFile('profile_picture')) {
        $user->profile_picture = $request->file('profile_picture')
            ->store('profiles', 'public');
    }

    if ($request->hasFile('certificate_image')) {
        $user->certificate_image = $request->file('certificate_image')
            ->store('certificates', 'public');
    }

    $user->update([
        'professional_title'  => $request->professional_title,
        'description'         => $request->description,
        'years_of_experience' => $request->years_of_experience,
        'license_number'      => $request->license_number,
        'practicing_since'    => $request->practicing_since,
        'specializations'     => $request->specializations ?? [],
        'sub_specializations' => $request->sub_specializations ?? [],
        'board_certificates'  => $request->board_certificates ?? [],
        'services'            => $request->services ?? [],
    ]);

  return response()->json([
    'message' => 'Doctor profile updated successfully',
    'user' => [
        'id' => $user->id,
        'firstName' => $user->first_name,
        'lastName' => $user->last_name,
        'middleInitial' => $user->middle_initial,
        'email' => $user->email,
        'contactNo' => $user->contact_no,
        'dob' => $user->dob,
        'sex' => $user->sex,
        'description' => $user->description,
        'professionalTitle' => $user->professional_title,
        'licenseNumber' => $user->license_number,
        'practicingSince' => $user->practicing_since,
        'specializations' => $user->specializations,
        'subSpecializations' => $user->sub_specializations,
        'boardCertificates' => $user->board_certificates,
        'services' => $user->services,
        'profilePictureUrl' => $user->profile_picture 
            ? asset('storage/' . $user->profile_picture)
            : null,
    ]
]);
}
}
