<?php
// app/Models/Patient.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    protected $primaryKey = 'patient_id';

    protected $fillable = [
        'user_id',
        'firstName',
        'lastName',
        'middleInitial',
        'dob',
        'sex',
        'genderIdentity',
        'civilStatus',
        'patientClassification',
        'contactNo',
        'email',
        'address',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'dob'       => 'date',
        'is_active' => 'boolean',
    ];

    /* Computed full name */
    public function getFullNameAttribute(): string
    {
        $mi = $this->middleInitial ? " {$this->middleInitial}." : '';
        return "{$this->firstName}{$mi} {$this->lastName}";
    }

    protected $appends = ['full_name'];

    /* Relationships */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'patient_id');
    }
}