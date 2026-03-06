<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Specialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    // Relationships
    public function doctors()
    {
        return $this->belongsToMany(
            Doctor::class,
            'doctor_specializations',
            'specialization_id',
            'doctor_id'
        )->withPivot('is_main')->withTimestamps();
    }

    public function subSpecializations()
    {
        return $this->hasMany(SubSpecialization::class);
    }
}