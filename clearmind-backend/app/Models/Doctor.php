<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Doctor extends Model
{
 protected $fillable = [
        'user_id',
        'professional_title',
        'description',
        'years_of_experience',
        'license_number',
        'practicing_since',
        'profile_picture',
        'certificate_image',
        'specializations',
        'sub_specializations',
        'board_certificates',
        'services',
    ];
     protected $casts = [
        'specializations'    => 'array',
        'sub_specializations'=> 'array',
        'board_certificates' => 'array',
        'services'           => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}