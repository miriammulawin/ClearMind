<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentPurpose extends Model
{
    protected $primaryKey = 'purpose_id';

    protected $fillable = [
        'service_id',
        'purpose_name',
        'price',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'decimal:2',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }
}