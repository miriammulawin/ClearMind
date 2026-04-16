<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DoctorScheduleController extends Controller
{
    // ────────────────────────────────────────────────────────────────
    // GET /api/doctors/{doctorId}/schedules
    // Returns all active working-hours windows grouped by day.
    // ────────────────────────────────────────────────────────────────
    public function index(int $doctorId): JsonResponse
    {
        $doctor = Doctor::findOrFail($doctorId);

        $schedules = DoctorSchedule::where('doctor_id', $doctorId)
    ->where('is_active', 1) // FIX HERE
    ->orderBy('day_of_week')
    ->get();

        // Build a map: day_num → schedule row (one per day)
        $grouped = [];

foreach ($schedules as $row) {
    $grouped[] = [
        'schedule_id' => $row->schedule_id,
        'day'         => DoctorSchedule::DAY_NAMES[$row->day_of_week],
        'day_num'     => $row->day_of_week,
        'start_time'  => $row->start_time,
        'end_time'    => $row->end_time,
        'slot_type'   => $row->slot_type,
        'is_active'   => $row->is_active,
    ];
}

        $activeDays   = $schedules->count();
        $onlineDays   = $schedules->whereIn('slot_type', ['online', 'both'])->count();
        $physicalDays = $schedules->whereIn('slot_type', ['physical', 'both'])->count();

        return response()->json([
            'data' => [
                'doctor'   => $doctor->load('user'),
                'summary'  => [
                    'active_days'   => $activeDays,
                    'online_days'   => $onlineDays,
                    'physical_days' => $physicalDays,
                ],
                'schedule' => $grouped,
            ],
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/doctors/{doctorId}/schedules/bulk
    // Replace all working-hours windows for a doctor.
    // Payload: { schedules: [{ day_of_week, start_time, end_time, slot_type }] }
    // ────────────────────────────────────────────────────────────────
    public function bulkStore(Request $request, int $doctorId): JsonResponse
    {
        Doctor::findOrFail($doctorId);

        $request->validate([
            'schedules'               => ['required', 'array', 'min:1'],
            'schedules.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'schedules.*.start_time'  => ['required', 'date_format:H:i'],
            'schedules.*.end_time'    => ['required', 'date_format:H:i'],
            'schedules.*.slot_type'   => ['required', Rule::in(['online', 'physical', 'both'])],
        ]);

        // Validate end > start for each entry
        foreach ($request->schedules as $i => $slot) {
            if ($slot['end_time'] <= $slot['start_time']) {
                return response()->json([
                    'message' => "Row {$i}: end_time must be after start_time.",
                ], 422);
            }
        }

        // Prevent duplicate days in the payload
        $days = array_column($request->schedules, 'day_of_week');
        if (count($days) !== count(array_unique($days))) {
            return response()->json([
                'message' => 'Duplicate day_of_week values in payload.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Soft-delete all existing windows for this doctor
            DoctorSchedule::where('doctor_id', $doctorId)->delete();

            $now      = now();
            $inserted = [];

            foreach ($request->schedules as $slot) {
                $inserted[] = DoctorSchedule::create([
                    'doctor_id'   => $doctorId,
                    'day_of_week' => $slot['day_of_week'],
                    'start_time'  => $slot['start_time'],
                    'end_time'    => $slot['end_time'],
                    'slot_type'   => $slot['slot_type'],
                    'is_active'   => true,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Schedule saved successfully.',
                'count'   => count($inserted),
                'data'    => $inserted,
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to save schedule.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/doctors/{doctorId}/schedules
    // Upsert a single day's working hours.
    // ────────────────────────────────────────────────────────────────
    public function store(Request $request, int $doctorId): JsonResponse
    {
        Doctor::findOrFail($doctorId);

        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'slot_type'   => ['required', Rule::in(['online', 'physical', 'both'])],
        ]);

        // Upsert: if a (soft-deleted or active) row exists, restore + update it
        $existing = DoctorSchedule::withTrashed()
            ->where('doctor_id', $doctorId)
            ->where('day_of_week', $validated['day_of_week'])
            ->first();

        if ($existing) {
            $existing->restore();
            $existing->update([
                'start_time' => $validated['start_time'],
                'end_time'   => $validated['end_time'],
                'slot_type'  => $validated['slot_type'],
                'is_active'  => true,
            ]);
            return response()->json([
                'message' => 'Schedule updated.',
                'data'    => $existing->fresh(),
            ]);
        }

        $schedule = DoctorSchedule::create([
            'doctor_id'   => $doctorId,
            'day_of_week' => $validated['day_of_week'],
            'start_time'  => $validated['start_time'],
            'end_time'    => $validated['end_time'],
            'slot_type'   => $validated['slot_type'],
            'is_active'   => true,
        ]);

        return response()->json([
            'message' => 'Schedule created.',
            'data'    => $schedule,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // PUT /api/doctors/{doctorId}/schedules/{scheduleId}
    // Update a single day's working hours.
    // ────────────────────────────────────────────────────────────────
    public function update(Request $request, int $doctorId, int $scheduleId): JsonResponse
    {
        $schedule = DoctorSchedule::where('doctor_id', $doctorId)
            ->findOrFail($scheduleId);

        $validated = $request->validate([
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time'   => ['sometimes', 'date_format:H:i', 'after:start_time'],
            'slot_type'  => ['sometimes', Rule::in(['online', 'physical', 'both'])],
            'is_active'  => ['sometimes', 'boolean'],
        ]);

        $schedule->update($validated);

        return response()->json([
            'message' => 'Schedule updated.',
            'data'    => $schedule->fresh(),
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // DELETE /api/doctors/{doctorId}/schedules/{scheduleId}
    // Remove a day's working hours.
    // ────────────────────────────────────────────────────────────────
    public function destroy(int $doctorId, int $scheduleId): JsonResponse
    {
        $schedule = DoctorSchedule::where('doctor_id', $doctorId)
            ->findOrFail($scheduleId);

        $schedule->delete();

        return response()->json(['message' => 'Schedule removed.']);
    }

    // ────────────────────────────────────────────────────────────────
    // GET /api/schedules/available?doctor_id=&date=YYYY-MM-DD
    // ────────────────────────────────────────────────────────────────
    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:doctors,doctor_id'],
            'date'      => ['required', 'date', 'after_or_equal:today'],
        ]);

        $date      = \Carbon\Carbon::parse($request->date);
        $dayOfWeek = (int) $date->dayOfWeek;

        $schedule = DoctorSchedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        return response()->json([
            'data' => [
                'date'      => $date->toDateString(),
                'day'       => DoctorSchedule::DAY_NAMES[$dayOfWeek],
                'doctor_id' => (int) $request->doctor_id,
                'schedule'  => $schedule,
            ],
        ]);
    }
}