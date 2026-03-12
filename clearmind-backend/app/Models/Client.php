<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_id',           // ← ADDED
        'appointment_status',
    ];

    protected $casts = [
        'appointment_status' => 'string',
    ];

    /**
     * Get the user that owns this client profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the doctor assigned to this client.
     */
    public function doctor(): BelongsTo  // ← ADDED
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function latestAppointment()
    {
        return $this->hasOne(Appointment::class)->latestOfMany();
    }

    public function scopePending($query)
    {
        return $query->where('appointment_status', 'Pending');
    }

    public function scopeScheduled($query)
    {
        return $query->where('appointment_status', 'Scheduled');
    }

    public function scopeCancelled($query)
    {
        return $query->where('appointment_status', 'Cancelled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('appointment_status', 'Completed');
    }
}