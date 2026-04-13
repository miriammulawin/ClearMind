<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'type',
        'document_name',
        'file_path',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}