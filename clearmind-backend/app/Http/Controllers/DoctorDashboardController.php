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

public function patientsList()
{
    $patients = User::where('role', 'Client')
                ->select('id', 'first_name', 'last_name', 'dob', 'sex',
                         'contact_no', 'email', 'appointment_status', 'created_at')
                ->latest()
                ->paginate(10);

    return response()->json($patients);
}

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
    $user = auth()->user();

    $user->update([
        'professional_title'  => $request->professional_title,
        'description'         => $request->description,
        'years_of_experience' => $request->years_of_experience,
        'license_number'      => $request->license_number,
        'specializations'     => $request->specializations,
        'sub_specializations' => $request->sub_specializations,
        'board_certificates'  => $request->board_certificates,
        'services'            => $request->services,
    ]);

    return response()->json(['message' => 'Setup complete.']);
}
}
