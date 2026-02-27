<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminPatientController extends Controller
{
    // ── GET /admin/patients ─────────────────────────────────────
    public function index()
    {
        $appointments = Appointment::with(['client.user'])
            ->latest('created_at')
            ->paginate(10);

        $appointments->getCollection()->transform(fn($appt) => $this->format($appt));

        return response()->json($appointments);
    }

    // ── GET /admin/patients/consultations ───────────────────────
    public function consultations()
    {
        $appointments = Appointment::with(['client.user'])
            ->where('status', 'Pending')
            ->latest('created_at')
            ->paginate(10);

        $appointments->getCollection()->transform(fn($appt) => $this->format($appt));

        return response()->json($appointments);
    }

    // ── GET /admin/patients/{id} ────────────────────────────────
    public function show($id)
    {
        $appt = Appointment::with(['client.user'])->findOrFail($id);
        $user = $appt->client->user ?? (object) [];

        return response()->json([
            ...$this->format($appt),
            'address' => $user->address ?? '—',
            'payment' => [
                'paid_amount'    => $appt->paid_amount    ?? null,
                'reference_no'   => $appt->reference_no   ?? null,
                'payment_option' => $appt->payment_option ?? null,
                'payment_proof'  => $appt->payment_proof
                    ? asset('storage/' . $appt->payment_proof)
                    : null,
            ],
        ]);
    }

    // ── PATCH /admin/patients/{id}/confirm ──────────────────────
    public function confirm($id)
    {
        $appt = Appointment::findOrFail($id);

        if ($appt->status !== 'Pending') {
            return response()->json(['message' => 'Only Pending appointments can be confirmed.'], 422);
        }

        $appt->update(['status' => 'Scheduled']);

        return response()->json(['message' => 'Appointment confirmed.', 'status' => 'Scheduled']);
    }

    // ── PATCH /admin/patients/{id}/complete ─────────────────────
    public function complete($id)
    {
        $appt = Appointment::findOrFail($id);

        if ($appt->status === 'Completed') {
            return response()->json(['message' => 'Already completed.'], 422);
        }

        $appt->update(['status' => 'Completed']);

        if ($appt->client) {
            $appt->client->update(['appointment_status' => 'Completed']);
        }

        return response()->json(['message' => 'Appointment completed.', 'status' => 'Completed']);
    }

    // ── Shared formatter ────────────────────────────────────────
    private function format(Appointment $appt): array
    {
        $user = $appt->client->user ?? (object) [];

        return [
            'id'      => $appt->id,
            'name'    => ($user->first_name ?? '—') . ' ' . ($user->last_name ?? ''),
            'contact' => $user->contact_no ?? '—',
            'email'   => $user->email      ?? '—',
            'date'    => $appt->appointment_date
                ? Carbon::parse($appt->appointment_date)->format('F d, Y') : '—',
            'time'    => $appt->appointment_time
                ? Carbon::parse($appt->appointment_time)->format('g:i A')  : '—',
            'type'    => $appt->visit_type,
            'status'  => $appt->status,
        ];
    }
}