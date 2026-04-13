<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'appointment_id';

    protected $fillable = [
        'booked_by_user_id',
        'patient_id',
        'informant_name',
        'informant_relation',
        'doctor_user_id',
        'appointment_date',
        'start_time',
        'end_time',
        'visit_type',
        'reason_for_consultation',
        'service_type',
        'pae_purpose',
        'payment_status',
        'receipt_paths',
        'reference_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'receipt_paths'    => 'array',
    ];

    protected $appends = ['receipt_urls'];

    // ── Auto-generate reference number when payment is paid ──
    protected static function booted(): void
    {
        static::creating(function (Appointment $appt) {
            if ($appt->payment_status === 'paid' && empty($appt->reference_number)) {
                $appt->reference_number = self::generateReferenceNumber();
            }
        });

        static::updating(function (Appointment $appt) {
            // Also generate if payment_status changes to paid later
            if ($appt->isDirty('payment_status') &&
                $appt->payment_status === 'paid' &&
                empty($appt->reference_number)) {
                $appt->reference_number = self::generateReferenceNumber();
            }
        });
    }

    /**
     * Generates a unique reference number: REF-YYYYMMDD-XXXXXX
     */
    public static function generateReferenceNumber(): string
    {
        do {
            $ref = 'REF-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (self::where('reference_number', $ref)->exists());

        return $ref;
    }

    public function getReceiptUrlsAttribute(): array
    {
        if (empty($this->receipt_paths)) return [];
        return array_map(
            fn($path) => Storage::disk('public')->url($path),
            $this->receipt_paths
        );
    }

    /* ── Relationships ── */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id', 'id');
    }

    public function bookedBy()
    {
        return $this->belongsTo(User::class, 'booked_by_user_id', 'id');
    }
}