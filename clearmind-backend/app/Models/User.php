<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'dob',
        'middle_initial',
        'address',
        'sex',
        'contact_no',
        'email',
        'password',
        'role',
        'is_active',
        
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
        'dob'               => 'date',
    ];

    /**
     * Relationship: Doctor profile (1:1)
     */
    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    /**
     * Relationship: Client profile (1:1)
     */
    public function client()
    {
        return $this->hasOne(Client::class);
    }

    /**
     * Accessor: Get the appropriate profile based on role
     *
     * Usage: $user->profile
     */
    public function getProfileAttribute()
    {
        return match ($this->role) {
            'Doctor' => $this->doctor,
            'Client' => $this->client,
            default  => null,
        };
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    /**
     * Check if user is doctor
     */
    public function isDoctor(): bool
    {
        return $this->role === 'Doctor';
    }

    /**
     * Check if user is client
     */
    public function isClient(): bool
    {
        return $this->role === 'Client';
    }

    /**
     * Get full name accessor
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}