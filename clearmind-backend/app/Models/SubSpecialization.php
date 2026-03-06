<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubSpecialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'specialization_id',
        'name',
        'description',
    ];

    // Relationships
    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function doctors()
    {
        return $this->belongsToMany(
            Doctor::class,
            'doctor_sub_specializations',
            'sub_specialization_id',
            'doctor_id'
        )->withTimestamps();
    }
}