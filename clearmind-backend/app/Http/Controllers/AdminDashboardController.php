<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
 public function patients(Request $request)
{
    $appointments = Appointment::with(['client.user'])
        ->latest('created_at')
        ->paginate(10);

    $appointments->getCollection()->transform(function ($appt) {
        $user = $appt->client->user ?? (object) [];
        return [
            'name'   => ($user->first_name ?? '—') . ' ' . ($user->last_name ?? ''),
            'gender' => $user->sex ?? '—',
            'date'   => $appt->appointment_date
                            ? \Carbon\Carbon::parse($appt->appointment_date)->format('F d, Y')
                            : '—',
            'time'   => $appt->appointment_time
                            ? \Carbon\Carbon::parse($appt->appointment_time)->format('g:i A')
                            : '—',
            'type'   => $appt->visit_type,
            'status' => $appt->status,
        ];
    });

    return response()->json($appointments);
}

public function statusCounts()
{
    $counts = Appointment::selectRaw("
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
    ")->first();

    return response()->json([
        'Scheduled' => (int) $counts->scheduled,
        'Completed' => (int) $counts->completed,
        'Cancelled' => (int) $counts->cancelled,
        'Pending'   => (int) $counts->pending,
    ]);
}

    public function monthlyPatients()
    {
        $monthly = Appointment::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
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
    public function totalClients()
        {
            return response()->json(['total' => Client::count()]);
        }
}