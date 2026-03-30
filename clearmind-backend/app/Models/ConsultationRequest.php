<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationRequest extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'concern',
        'urgency',
        'preferred_date',
        'preferred_time',
        'type',
        'status',
        'admin_notes',
        'appointment_id',
    ];

    protected $casts = [
        'preferred_date' => 'date',
    ];

    // ── Constants ──
    const URGENCY_LOW       = 'low';
    const URGENCY_NORMAL    = 'normal';
    const URGENCY_HIGH      = 'high';
    const URGENCY_EMERGENCY = 'emergency';

    const STATUS_PENDING  = 'pending';
    const STATUS_REVIEWED = 'reviewed';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // ── Relationships ──
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    // ── Scopes ──
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('urgency', [self::URGENCY_HIGH, self::URGENCY_EMERGENCY]);
    }
}