<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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
        'appointment_ref',
        'payment_reference',
        'bill_amount',      // ← BAGO
        'status',
        'notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'receipt_paths'    => 'array',
        'progression_note' => 'array',
        'clinical_notes'   => 'array',
        'bill_amount'      => 'decimal:2',  // ← BAGO
    ];

    protected $appends = ['receipt_urls'];

    protected static function booted(): void
    {
        static::creating(function (Appointment $appt) {
            if (empty($appt->appointment_ref)) {
                $appt->appointment_ref = self::generateAppointmentRef(
                    $appt->service_type,
                    $appt->appointment_date
                        ? (is_string($appt->appointment_date)
                            ? $appt->appointment_date
                            : $appt->appointment_date->format('Y-m-d'))
                        : now()->format('Y-m-d')
                );
            }
        });

        static::updating(function (Appointment $appt) {
            if ($appt->isDirty('service_type')) {
                $appt->appointment_ref = self::generateAppointmentRef(
                    $appt->service_type,
                    $appt->appointment_date
                        ? (is_string($appt->appointment_date)
                            ? $appt->appointment_date
                            : $appt->appointment_date->format('Y-m-d'))
                        : now()->format('Y-m-d')
                );
            }
        });
    }

    public static function generateAppointmentRef(
        ?string $serviceType,
        ?string $date = null
    ): string {
        $date   = $date ?? now()->format('Y-m-d');
        $prefix = self::prefixFromService($serviceType);

        $pattern = "{$prefix}-{$date}-%";
        $count   = self::withTrashed()
                       ->where('appointment_ref', 'like', $pattern)
                       ->count();

        $seq = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        $ref = "{$prefix}-{$date}-{$seq}";

        while (self::withTrashed()->where('appointment_ref', $ref)->exists()) {
            $count++;
            $seq = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            $ref = "{$prefix}-{$date}-{$seq}";
        }

        return $ref;
    }

    public static function prefixFromService(?string $serviceType): string
    {
        if (empty($serviceType)) return 'PAC';
        $lower = strtolower($serviceType);
        if (
            str_contains($lower, 'psychological assessment') ||
            str_contains($lower, 'assessment and evaluation') ||
            str_contains($lower, 'pae')
        ) {
            return 'PAE';
        }
        return 'PAC';
    }

    public function getReceiptUrlsAttribute(): array
    {
        if (empty($this->receipt_paths)) return [];
        return array_map(
            fn($path) => Storage::disk('public')->url($path),
            $this->receipt_paths
        );
    }

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