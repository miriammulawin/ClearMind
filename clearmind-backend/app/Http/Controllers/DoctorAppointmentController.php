<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DoctorAppointmentController extends Controller
{
    /**
     * GET /doctor/appointments
     * Returns all appointments for the calendar (as events) and list view.
     * Optional: ?month=2026-03 to filter by month, ?status=Pending, etc.
     */
    public function index(Request $request)
    {
        try {
            $doctor = auth()->user()->doctor;
            if (!$doctor) return response()->json(['error' => 'Doctor not found'], 404);

            $query = Appointment::where('doctor_id', $doctor->id)
                ->with(['client.user']);

            // Optional filters
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('visit_type')) {
                $query->where('visit_type', $request->visit_type);
            }
            if ($request->filled('date_from')) {
                $query->whereDate('appointment_date', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $query->whereDate('appointment_date', '<=', $request->date_to);
            }

            $appointments = $query->orderBy('appointment_date')->orderBy('appointment_time')->get();

            // Format for react-big-calendar
            $events = $appointments->map(function ($appt) {
                $date     = $appt->appointment_date->format('Y-m-d');
                $timeStr  = $appt->appointment_time ?? '09:00:00';
                $start    = Carbon::parse("$date $timeStr");
                $end      = $start->copy()->addHour();

                $firstName = $appt->client?->user?->first_name ?? '';
                $lastName  = $appt->client?->user?->last_name  ?? '';
                $name      = trim("$firstName $lastName") ?: 'Unknown Patient';

                return [
                    'id'         => $appt->id,
                    'title'      => "{$appt->visit_type} – {$name}",
                    'start'      => $start->toIso8601String(),
                    'end'        => $end->toIso8601String(),
                    'allDay'     => false,
                    'status'     => $appt->status,
                    'visit_type' => $appt->visit_type,
                    'client'     => [
                        'id'         => $appt->client?->id,
                        'first_name' => $firstName,
                        'last_name'  => $lastName,
                        'email'      => $appt->client?->user?->email,
                        'contact_no' => $appt->client?->user?->contact_no,
                        'sex'        => $appt->client?->user?->sex,
                        'dob'        => $appt->client?->user?->dob,
                    ],
                    'appointment_date' => $date,
                    'appointment_time' => $timeStr,
                ];
            });

            return response()->json(['success' => true, 'data' => $events], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /doctor/appointments
     * Create a new appointment.
     */
    public function store(Request $request)
    {
        try {
            $doctor = auth()->user()->doctor;
            if (!$doctor) return response()->json(['error' => 'Doctor not found'], 404);

            $request->validate([
                'client_id'        => 'required|exists:clients,id',
                'appointment_date' => 'required|date',
                'appointment_time' => 'required',
                'visit_type'       => 'required|in:Online,Physical',
                'status'           => 'nullable|in:Pending,Scheduled,Cancelled,Completed',
            ]);

            // Verify the client belongs to this doctor
            $client = Client::where('id', $request->client_id)
                ->where('doctor_id', $doctor->id)
                ->first();

            if (!$client) {
                return response()->json(['error' => 'Patient not found or does not belong to you'], 403);
            }

            $appointment = Appointment::create([
                'client_id'        => $request->client_id,
                'doctor_id'        => $doctor->id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'visit_type'       => $request->visit_type,
                'status'           => $request->status ?? 'Pending',
            ]);

            $appointment->load('client.user');

            $date    = $appointment->appointment_date->format('Y-m-d');
            $timeStr = $appointment->appointment_time;
            $start   = Carbon::parse("$date $timeStr");
            $end     = $start->copy()->addHour();

            $firstName = $appointment->client?->user?->first_name ?? '';
            $lastName  = $appointment->client?->user?->last_name  ?? '';
            $name      = trim("$firstName $lastName") ?: 'Unknown Patient';

            return response()->json([
                'success' => true,
                'message' => 'Appointment created successfully',
                'event'   => [
                    'id'         => $appointment->id,
                    'title'      => "{$appointment->visit_type} – {$name}",
                    'start'      => $start->toIso8601String(),
                    'end'        => $end->toIso8601String(),
                    'allDay'     => false,
                    'status'     => $appointment->status,
                    'visit_type' => $appointment->visit_type,
                    'client'     => [
                        'id'         => $appointment->client?->id,
                        'first_name' => $firstName,
                        'last_name'  => $lastName,
                        'email'      => $appointment->client?->user?->email,
                        'contact_no' => $appointment->client?->user?->contact_no,
                        'sex'        => $appointment->client?->user?->sex,
                        'dob'        => $appointment->client?->user?->dob,
                    ],
                    'appointment_date' => $date,
                    'appointment_time' => $timeStr,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * PATCH /doctor/appointments/{id}/status
     * Update appointment status (Pending → Scheduled → Completed / Cancelled)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $doctor = auth()->user()->doctor;
            if (!$doctor) return response()->json(['error' => 'Doctor not found'], 404);

            $request->validate([
                'status' => 'required|in:Pending,Scheduled,Cancelled,Completed',
            ]);

            $appointment = Appointment::where('id', $id)
                ->where('doctor_id', $doctor->id)
                ->firstOrFail();

            $appointment->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => "Appointment marked as {$request->status}",
                'status'  => $appointment->status,
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /doctor/appointments/{id}
     * Delete (cancel) an appointment.
     */
    public function destroy($id)
    {
        try {
            $doctor = auth()->user()->doctor;
            if (!$doctor) return response()->json(['error' => 'Doctor not found'], 404);

            $appointment = Appointment::where('id', $id)
                ->where('doctor_id', $doctor->id)
                ->firstOrFail();

            $appointment->delete();

            return response()->json(['success' => true, 'message' => 'Appointment deleted'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /doctor/patients-list
     * Returns a simple list of patients assigned to the doctor (for the dropdown).
     */
    public function patientsList()
    {
        try {
            $doctor = auth()->user()->doctor;
            if (!$doctor) return response()->json(['error' => 'Doctor not found'], 404);

            $patients = Client::where('doctor_id', $doctor->id)
                ->with('user')
                ->get()
                ->map(fn($c) => [
                    'id'         => $c->id,
                    'first_name' => $c->user?->first_name ?? '',
                    'last_name'  => $c->user?->last_name  ?? '',
                    'mi'         => $c->user?->middle_initial ?? '',
                    'email'      => $c->user?->email,
                    'contact_no' => $c->user?->contact_no,
                    'sex'        => $c->user?->sex,
                    'dob'        => $c->user?->dob,
                ]);

            return response()->json(['success' => true, 'data' => $patients], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}