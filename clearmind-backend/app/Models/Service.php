<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $primaryKey = 'service_id';

    protected $fillable = [
        'service_name',
        'description',
        'price',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',    
        'price'        => 'decimal:2',
    ];

    public function purposes()
    {
        return $this->hasMany(AssessmentPurpose::class, 'service_id', 'service_id');
    }

    // Check if this service is the Psychological Assessment one
    public function isPsychologicalAssessment(): bool
    {
        return str_contains(strtolower($this->service_name), 'psychological assessment');
    }
}