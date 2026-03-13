<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'title',
        'message',
        'priority',
        'type',
        'is_pinned',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    /**
     * Get the doctor that created this announcement
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the user associated with this announcement (through doctor)
     */
    public function user()
    {
        return $this->through('doctor')->has('user');
    }

    /**
     * Scope: Get announcements by doctor
     */
    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope: Get announcements by type (clinic or doctor)
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Get pinned announcements first
     */
    public function scopeOrdered($query)
    {
        return $query->orderByDesc('is_pinned')
                     ->orderByDesc('created_at');
    }

    /**
     * Scope: Get announcements for a specific doctor (clinic-wide + their own)
     */
    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where(function ($q) use ($doctorId) {
            $q->where('type', 'clinic')
              ->orWhere('doctor_id', $doctorId);
        })->ordered();
    }
}