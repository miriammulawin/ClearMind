<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DoctorImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'type',  
        'path',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}