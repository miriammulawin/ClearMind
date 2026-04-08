<?php
// app/Models/Clinic.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Clinic extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'clinic_id';

    protected $fillable = [
        'clinic_name',
        'clinic_type',
        'clinic_address',
        'blk',
        'barangay',
        'city',
        'province',
        'region',
        'zip_code',
        'clinic_image',
        'clinic_description',
        'clinic_schedule',
        'clinic_paymentMethod',
        'clinic_fee',
        'qr_image',
    ];

    protected $casts = [
        // Automatically encode/decode clinic_schedule as array
        'clinic_schedule' => 'array',
    ];

    /**
     * Return the public URL for clinic_image if it exists.
     */
    public function getClinicImageUrlAttribute(): ?string
    {
        return $this->clinic_image
            ? asset('storage/' . $this->clinic_image)
            : null;
    }

    /**
     * Return the public URL for qr_image if it exists.
     */
    public function getQrImageUrlAttribute(): ?string
    {
        return $this->qr_image
            ? asset('storage/' . $this->qr_image)
            : null;
    }

    /**
     * Append virtual URL attributes to JSON output.
     */
    protected $appends = ['clinic_image_url', 'qr_image_url'];
}