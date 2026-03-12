<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'doctor_id',         // ← ADDED: was missing, caused the DB error
        'appointment_date',
        'appointment_time',
        'visit_type',
        'status',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'string',
    ];

    /**
     * Relationship with Client
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relationship with Doctor (direct)
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Scope: Get today's appointments
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', now());
    }

    /**
     * Scope: Get online appointments
     */
    public function scopeOnline($query)
    {
        return $query->where('visit_type', 'Online');
    }

    /**
     * Scope: Get physical appointments
     */
    public function scopePhysical($query)
    {
        return $query->where('visit_type', 'Physical');
    }

    /**
     * Scope: Get appointments for a specific status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Get appointments for a specific date
     */
    public function scopeOnDate($query, $date)
    {
        return $query->whereDate('appointment_date', $date);
    }

    /**
     * Check if appointment is for today
     */
    public function isToday()
    {
        return $this->appointment_date->isToday();
    }

    /**
     * Check if appointment is in the past
     */
    public function isPast()
    {
        return $this->appointment_date->isPast();
    }

    /**
     * Check if appointment is in the future
     */
    public function isFuture()
    {
        return $this->appointment_date->isFuture();
    }
}