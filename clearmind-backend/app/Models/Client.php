<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Client extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'appointment_status',
        // Add more later, e.g.:
        // 'preferred_language',
        // 'emergency_contact',
        // 'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'appointment_status' => 'string', // or 'enum:Pending,Scheduled,Cancelled,Completed' in Laravel 11+
        // 'created_at' => 'datetime',
        // 'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns this client profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

        public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function latestAppointment()
        {
            return $this->hasOne(Appointment::class)->latestOfMany();
        }

    // Optional: helpful scopes for cleaner queries
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