<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_date',
        'appointment_time',
        'type',
        'status',
        'reason',
        'notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'appointment_date' => 'date',
    ];

    // ── Constants ──
    const TYPE_ONLINE   = 'online';
    const TYPE_PHYSICAL = 'physical';

    const STATUS_PENDING   = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_NO_SHOW   = 'no_show';

    // ── Relationships ──
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function consultationRequest(): HasOne
    {
        return $this->hasOne(ConsultationRequest::class);
    }

    // ── Scopes ──
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', today());
    }

    public function scopeOnline($query)
    {
        return $query->where('type', self::TYPE_ONLINE);
    }

    public function scopePhysical($query)
    {
        return $query->where('type', self::TYPE_PHYSICAL);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }
}