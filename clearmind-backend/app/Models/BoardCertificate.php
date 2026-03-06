<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BoardCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'expiry_date' => 'date',
    ];

    // Relationships
    public function doctors()
    {
        return $this->belongsToMany(
            Doctor::class,
            'doctor_board_certificates',
            'board_certificate_id',
            'doctor_id'
        )->withPivot(['certificate_number', 'issued_date', 'expiry_date', 'certificate_image'])
         ->withTimestamps();
    }
}