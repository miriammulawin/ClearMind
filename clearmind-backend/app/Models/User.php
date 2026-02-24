<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        // ── Core ──────────────────────────────────────────
        'first_name',
        'last_name',
        'dob',
        'sex',
        'contact_no',
        'email',
        'password',
        'role',
        'is_active',
        'prc_number',
        'appointment_status',

        // ── Doctor Profile ─────────────────────────────────
        'professional_title',
        'description',
        'years_of_experience',
        'license_number',
        'specializations',
        'sub_specializations',
        'board_certificates',
        'services',
        'profile_picture',
        'certificate_image',
        'practicing_since',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'dob'                => 'date:Y-m-d',
            'is_active'          => 'boolean',
            'password'           => 'hashed',
            // Auto encode/decode JSON columns
            'specializations'    => 'array',
            'sub_specializations'=> 'array',
            'board_certificates' => 'array',
            'services'           => 'array',
        ];
    }

    // ── Accessors ──────────────────────────────────────────────────
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Return the full public URL for the profile picture.
     * Returns null if no picture is set.
     */
    public function getProfilePictureUrlAttribute(): ?string
    {
        if (!$this->profile_picture) return null;
        return asset('storage/' . $this->profile_picture);
    }

    /**
     * Return the full public URL for the certificate image.
     */
    public function getCertificateImageUrlAttribute(): ?string
    {
        if (!$this->certificate_image) return null;
        return asset('storage/' . $this->certificate_image);
    }
}