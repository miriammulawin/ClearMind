<?php
// app/Models/Appointment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    // ✅ FIXED: tell Eloquent the PK is appointment_id, not id
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
        'status',
        'notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'receipt_paths'    => 'array', // auto JSON encode/decode
    ];

    // ✅ Appends full public URLs so the frontend can display receipts directly
    protected $appends = ['receipt_urls'];

    public function getReceiptUrlsAttribute(): array
    {
        if (empty($this->receipt_paths)) return [];

        return array_map(
            fn($path) => Storage::disk('public')->url($path),
            $this->receipt_paths
        );
    }

    /* ── Relationships ── */

    // ✅ FIXED: explicit foreign + owner keys because patient PK is patient_id not id
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    // ✅ FIXED: explicit foreign key so Eloquent doesn't guess 'appointment_id' on User
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id', 'id');
    }

    public function bookedBy()
    {
        return $this->belongsTo(User::class, 'booked_by_user_id', 'id');
    }
}