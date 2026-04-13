<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_ADMIN  = 'Admin';
    const ROLE_DOCTOR = 'Doctor';
    const ROLE_CLIENT = 'Client';

    const SEX_MALE   = 'male';
    const SEX_FEMALE = 'female';
    const SEX_OTHER  = 'other';

    const GENDER_FEMALE      = 'female';
    const GENDER_MALE        = 'male';
    const GENDER_TRANSGENDER = 'transgender';
    const GENDER_TRANS_WOMAN = 'trans_woman';
    const GENDER_TRANS_MAN   = 'trans_man';
    const GENDER_NON_BINARY  = 'non_binary';
    const GENDER_GENDERQUEER = 'genderqueer';
    const GENDER_FLUID       = 'gender_fluid';
    const GENDER_AGENDER     = 'agender';
    const GENDER_BIGENDER    = 'bigender';
    const GENDER_TWO_SPIRIT  = 'two_spirit';
    const GENDER_INTERSEX    = 'intersex';
    const GENDER_PANGENDER   = 'pangender';
    const GENDER_PREFER_NOT  = 'prefer_not';

    const PRONOUN_HE_HIM    = 'he_him';
    const PRONOUN_SHE_HER   = 'she_her';
    const PRONOUN_THEY_THEM = 'they_them';
    const PRONOUN_OTHER     = 'other';

   protected $fillable = [
    'firstName',
    'lastName',
    'middleInitial',
    'dob',
    'sex',
    'genderIdentity',
    'preferredPronoun',
    'customPronoun',
    'contactNo',
    'civilStatus',
    'patientClassification',
    'address',
    'email',
    'password',
    'role',
    'is_active',
    'email_verified_at',
    'email_verification_code',
];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────────────

    public function doctor()
    {
        return $this->hasOne(Doctor::class, 'user_id', 'id');
    }

    // ── Helpers ───────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isDoctor(): bool
    {
        return $this->role === self::ROLE_DOCTOR;
    }

    public function isClient(): bool
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function getFullNameAttribute(): string
    {
        $mi = $this->middleInitial ? " {$this->middleInitial}." : '';
        return "{$this->firstName}{$mi} {$this->lastName}";
    }

    public function getDisplayPronounAttribute(): ?string
    {
        if ($this->preferredPronoun === self::PRONOUN_OTHER) {
            return $this->customPronoun;
        }
        return $this->preferredPronoun;
    }

    public function getGenderIdentityLabelAttribute(): ?string
    {
        $labels = [
            self::GENDER_FEMALE      => 'Female',
            self::GENDER_MALE        => 'Male',
            self::GENDER_TRANSGENDER => 'Transgender',
            self::GENDER_TRANS_WOMAN => 'Trans Woman',
            self::GENDER_TRANS_MAN   => 'Trans Man',
            self::GENDER_NON_BINARY  => 'Non-Binary',
            self::GENDER_GENDERQUEER => 'Genderqueer',
            self::GENDER_FLUID       => 'Gender Fluid',
            self::GENDER_AGENDER     => 'Agender',
            self::GENDER_BIGENDER    => 'Bigender',
            self::GENDER_TWO_SPIRIT  => 'Two-Spirit',
            self::GENDER_INTERSEX    => 'Intersex',
            self::GENDER_PANGENDER   => 'Pangender',
            self::GENDER_PREFER_NOT  => 'Prefer Not to Say',
        ];

        return $labels[$this->genderIdentity] ?? null;
    }
}