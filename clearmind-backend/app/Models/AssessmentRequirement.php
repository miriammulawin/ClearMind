<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssessmentRequirement extends Model
{
    use HasFactory;

    protected $primaryKey = 'requirement_id';

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_user_id',
        'purpose_id',

        // VAWC / Legal docs
        'blotter_report_path',
        'police_report_path',
        'cswd_endorsement_path',

        // Legal
        'legal_type',

        // School
        'school_institution',
        'incident_report_path',

        // Work-related
        'company_employer',

        // Pre-Employment
        'employer_name',
        'wants_printed_report',

        // ESA
        'travel_type',
        'has_diagnosis',
        'diagnosis_file_path',

        // Internship
        'school_name',
        'program',
    ];

    protected $casts = [
        'wants_printed_report' => 'boolean',
        'has_diagnosis'        => 'boolean',
    ];

    /* ── Relationships ───────────────────────────────────────── */

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_user_id', 'id');
    }

    public function assessmentPurpose()
    {
        return $this->belongsTo(AssessmentPurpose::class, 'purpose_id', 'purpose_id');
    }
}