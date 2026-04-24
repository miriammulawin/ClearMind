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
        'appointment_ref',      // always auto-generated — PAC/PAE-YYYY-MM-DD-XXXX
        'payment_reference',    // optional — user-entered GCash/bank ref number
        'status',
        'notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'receipt_paths'    => 'array',
        'progression_note' => 'array',
        'clinical_notes'   => 'array',
    ];

    protected $appends = ['receipt_urls'];

    /* ══════════════════════════════════════════════════════════════════
       Boot hooks
    ══════════════════════════════════════════════════════════════════ */
    protected static function booted(): void
    {
        // Always generate an appointment_ref on every new appointment
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

        // If service_type changes on an existing appointment, regenerate the ref
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

    /* ══════════════════════════════════════════════════════════════════
       generateAppointmentRef
       ──────────────────────────────────────────────────────────────
       Generates a unique appointment reference number.

       Format: PREFIX-YYYY-MM-DD-XXXX
         PREFIX  → PAE  (Psychological Assessment & Evaluation)
                 → PAC  (Psychotherapy / Counseling — default)
         DATE    → appointment_date in YYYY-MM-DD
         XXXX    → zero-padded sequential count per prefix+date
    ══════════════════════════════════════════════════════════════════ */
    public static function generateAppointmentRef(
        ?string $serviceType,
        ?string $date = null
    ): string {
        $date   = $date ?? now()->format('Y-m-d');
        $prefix = self::prefixFromService($serviceType);

        // Count all existing (including soft-deleted) refs for this prefix+date
        $pattern = "{$prefix}-{$date}-%";
        $count   = self::withTrashed()
                       ->where('appointment_ref', 'like', $pattern)
                       ->count();

        $seq = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        $ref = "{$prefix}-{$date}-{$seq}";

        // Race-condition safety: keep incrementing if ref already exists
        while (self::withTrashed()->where('appointment_ref', $ref)->exists()) {
            $count++;
            $seq = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            $ref = "{$prefix}-{$date}-{$seq}";
        }

        return $ref;
    }

    /* ──────────────────────────────────────────────────────────────
       Determine PAE or PAC prefix from service type string
    ────────────────────────────────────────────────────────────── */
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

    /* ══════════════════════════════════════════════════════════════════
       Accessor — full public URLs for receipt files
    ══════════════════════════════════════════════════════════════════ */
    public function getReceiptUrlsAttribute(): array
    {
        if (empty($this->receipt_paths)) return [];

        return array_map(
            fn($path) => Storage::disk('public')->url($path),
            $this->receipt_paths
        );
    }

    /* ══════════════════════════════════════════════════════════════════
       Relationships
    ══════════════════════════════════════════════════════════════════ */
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