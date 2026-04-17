<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'doctor_id';

    protected $fillable = [
        'user_id',
        'prc_number',
        'professional_title',
        'description',
        'years_of_experience',
        'license_number',
        'practicing_since',
        'main_specialty',
        'profile_picture',

        // JSON array fields
        'specializations',
        'sub_specializations',
        'board_cert_names',
        'board_cert_images',
        'id_pictures',
        'services',

        'profile_completed',
        'profile_completed_at',
    ];

    protected $casts = [
        'years_of_experience'  => 'integer',
        'profile_completed'    => 'boolean',
        'profile_completed_at' => 'datetime',

        // Automatically encode/decode JSON columns
        'specializations'      => 'array',
        'sub_specializations'  => 'array',
        'board_cert_names'     => 'array',
        'board_cert_images'    => 'array',
        'id_pictures'          => 'array',
        'services'             => 'array',
    ];
public function user()
{
    return $this->belongsTo(\App\Models\User::class, 'user_id', 'id');
}
}