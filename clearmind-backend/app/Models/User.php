<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Roles
    const ROLE_ADMIN  = 'Admin';
    const ROLE_DOCTOR = 'Doctor';
    const ROLE_CLIENT = 'Client';

    protected $fillable = [
        'firstName',
        'lastName',
        'middleInitial',
        'dob',
        'sex',
        'contactNo',
        'email',
        'password',
        'role',
        'address',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    // ---------- Helpers ----------

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
}