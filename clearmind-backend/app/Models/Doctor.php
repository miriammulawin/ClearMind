<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'doctor_id';

    protected $fillable = [
        'user_id',
        'prc_number',
        'professional_title',
        'description',
        'years_of_experience',
        'license_number',
        'practicing_since',
        'profile_picture',
        'profile_completed',
        'profile_completed_at',
    ];

    protected $casts = [
        'profile_completed'    => 'boolean',
        'profile_completed_at' => 'datetime',
        'years_of_experience'  => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}