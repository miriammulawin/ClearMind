<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'professional_title',
        'description',
        'years_of_experience',
        'license_number',
        'practicing_since',
        'profile_picture',
        'prc_number',
        // certificate_images and id_pictures removed — now in doctor_images table
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Images (normalized separate table) ───────────────────────
    public function images()
    {
        return $this->hasMany(DoctorImage::class);
    }

    public function certificateImages()
    {
        return $this->hasMany(DoctorImage::class)->where('type', 'certificate');
    }

    public function idPictures()
    {
        return $this->hasMany(DoctorImage::class)->where('type', 'id_picture');
    }

    // ── Specializations ───────────────────────────────────────────
    public function specializations()
    {
        return $this->belongsToMany(
            Specialization::class,
            'doctor_specializations',
            'doctor_id',
            'specialization_id'
        )->withPivot('is_main')->withTimestamps();
    }

    public function mainSpecialization()
    {
        return $this->specializations()
            ->wherePivot('is_main', true)
            ->first();
    }

    public function subSpecializations()
    {
        return $this->belongsToMany(
            SubSpecialization::class,
            'doctor_sub_specializations',
            'doctor_id',
            'sub_specialization_id'
        )->withTimestamps();
    }

    public function services()
    {
        return $this->belongsToMany(
            Service::class,
            'doctor_services',
            'doctor_id',
            'service_id'
        )->withTimestamps();
    }

    public function boardCertificates()
    {
        return $this->belongsToMany(
            BoardCertificate::class,
            'doctor_board_certificates',
            'doctor_id',
            'board_certificate_id'
        )->withPivot(['certificate_number', 'issued_date', 'expiry_date', 'certificate_image'])
         ->withTimestamps();
    }

    public function hasValidBoardCertificates()
    {
        return $this->boardCertificates()
            ->whereNull('expiry_date')
            ->orWhere('expiry_date', '>', now())
            ->exists();
    }
}