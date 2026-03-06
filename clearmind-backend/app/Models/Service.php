<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
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
            'doctor_services',
            'service_id',
            'doctor_id'
        )->withTimestamps();
    }
}