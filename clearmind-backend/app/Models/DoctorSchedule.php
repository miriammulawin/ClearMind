<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorSchedule extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'schedule_id';

    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'start_time',
        'end_time',
        'slot_type',
        'is_active',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'is_active'   => 'boolean',
    ];

    const DAY_NAMES = [
        0 => 'Sunday',
        1 => 'Monday',
        2 => 'Tuesday',
        3 => 'Wednesday',
        4 => 'Thursday',
        5 => 'Friday',
        6 => 'Saturday',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }

    /**
     * Accessor: return formatted time strings for API output.
     */
    public function getStartTimeFormattedAttribute(): string
    {
        return $this->start_time ? substr($this->start_time, 0, 5) : '';
    }

    public function getEndTimeFormattedAttribute(): string
    {
        return $this->end_time ? substr($this->end_time, 0, 5) : '';
    }
}