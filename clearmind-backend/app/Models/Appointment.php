<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Appointment extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'client_id',
        'appointment_date',
        'appointment_time',
        'visit_type',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}