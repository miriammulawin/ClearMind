<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Get EXISTING doctor (DO NOT CREATE) ───────────────────────
        $doctor = User::where('role', User::ROLE_DOCTOR)->first();

        if (!$doctor) {
            throw new \Exception('No doctor found. Please make sure a doctor already exists.');
        }

        // ── 2. Patient seed data ─────────────────────────────────────────
        // ── 2. Patient seed data ─────────────────────────────────────────
$patients = [
    // EXISTING 1
    [
        'user' => [
            'firstName' => 'Liezel',
            'lastName' => 'Paciente',
            'middleInitial' => 'R',
            'dob' => '1990-03-14',
            'sex' => 'female',
            'genderIdentity' => 'female',
            'preferredPronoun' => 'she_her',
            'contactNo' => '09171234567',
            'email' => 'liezel.paciente@clearmind.com',
            'password' => Hash::make('client123'),
            'role' => User::ROLE_CLIENT,
            'is_active' => true,
        ],
        'patient' => [
            'firstName' => 'Liezel',
            'lastName' => 'Paciente',
            'middleInitial' => 'R',
            'dob' => '1990-03-14',
            'sex' => 'female',
            'genderIdentity' => 'female',
            'civilStatus' => 'single',
            'patientClassification' => 'Regular',
            'contactNo' => '09171234567',
            'email' => 'liezel.paciente@clearmind.com',
            'address' => '123 Sampaguita St, Calamba, Laguna',
            'is_active' => true,
        ],
        'appointment' => [
            'appointment_date' => '2026-01-20',
            'start_time' => '14:00:00',
            'end_time' => '15:00:00',
            'visit_type' => 'onsite',
            'reason_for_consultation' => 'Follow-up: tension headache',
            'service_type' => 'PAC',
            'payment_status' => 'paid',
            'status' => 'completed',
            'notes' => 'Persistent headache and dizziness.',
        ],
    ],

    // ✅ NEW PATIENT 1
    [
        'user' => [
            'firstName' => 'John Mark',
            'lastName' => 'Dela Cruz',
            'middleInitial' => 'T',
            'dob' => '1995-08-12',
            'sex' => 'male',
            'genderIdentity' => 'male',
            'preferredPronoun' => 'he_him',
            'contactNo' => '09451234567',
            'email' => 'john.delacruz@clearmind.com',
            'password' => Hash::make('client123'),
            'role' => User::ROLE_CLIENT,
            'is_active' => true,
        ],
        'patient' => [
            'firstName' => 'John Mark',
            'lastName' => 'Dela Cruz',
            'middleInitial' => 'T',
            'dob' => '1995-08-12',
            'sex' => 'male',
            'genderIdentity' => 'male',
            'civilStatus' => 'single',
            'patientClassification' => 'Regular',
            'contactNo' => '09451234567',
            'email' => 'john.delacruz@clearmind.com',
            'address' => '15 Bonifacio St, Quezon City',
            'is_active' => true,
        ],
        'appointment' => [
            'appointment_date' => '2026-02-12',
            'start_time' => '10:30:00',
            'end_time' => '11:30:00',
            'visit_type' => 'virtual',
            'reason_for_consultation' => 'New concern: anxiety symptoms',
            'service_type' => 'PAC',
            'payment_status' => 'paid',
            'status' => 'completed',
            'notes' => 'Patient reports recurring anxiety episodes. Advised CBT techniques.',
        ],
    ],

    // ✅ NEW PATIENT 2
    [
        'user' => [
            'firstName' => 'Angela',
            'lastName' => 'Reyes',
            'middleInitial' => 'P',
            'dob' => '2000-05-25',
            'sex' => 'female',
            'genderIdentity' => 'female',
            'preferredPronoun' => 'she_her',
            'contactNo' => '09561234567',
            'email' => 'angela.reyes@clearmind.com',
            'password' => Hash::make('client123'),
            'role' => User::ROLE_CLIENT,
            'is_active' => true,
        ],
        'patient' => [
            'firstName' => 'Angela',
            'lastName' => 'Reyes',
            'middleInitial' => 'P',
            'dob' => '2000-05-25',
            'sex' => 'female',
            'genderIdentity' => 'female',
            'civilStatus' => 'single',
            'patientClassification' => 'Regular',
            'contactNo' => '09561234567',
            'email' => 'angela.reyes@clearmind.com',
            'address' => '88 Katipunan Ave, Quezon City',
            'is_active' => true,
        ],
        'appointment' => [
            'appointment_date' => '2026-02-18',
            'start_time' => '15:00:00',
            'end_time' => '16:00:00',
            'visit_type' => 'onsite',
            'reason_for_consultation' => 'Check-up: stress management',
            'service_type' => 'PAC',
            'payment_status' => 'not_paid',
            'status' => 'confirmed',
            'notes' => null,
        ],
    ],
];

        // ── 3. Seed each patient + appointment ───────────────────────────
        foreach ($patients as $seed) {

            // Create or update User
            $userAccount = User::updateOrCreate(
                ['email' => $seed['user']['email']],
                $seed['user']
            );

            // Create or update Patient
            $patient = Patient::updateOrCreate(
                ['email' => $seed['patient']['email']],
                array_merge($seed['patient'], [
                    'user_id' => $userAccount->id
                ])
            );

           // Create or update FIRST Appointment
Appointment::updateOrCreate(
    [
        'patient_id'       => $patient->patient_id,
        'doctor_user_id'   => $doctor->id,
        'appointment_date' => $seed['appointment']['appointment_date'],
        'start_time'       => $seed['appointment']['start_time'],
    ],
    array_merge($seed['appointment'], [
        'booked_by_user_id' => $userAccount->id,
        'patient_id'        => $patient->patient_id,
        'doctor_user_id'    => $doctor->id,
    ])
);

// ✅ ADD SECOND APPOINTMENT if COMPLETED (makes them EXISTING)
if ($seed['appointment']['status'] === 'completed') {
    Appointment::create([
        'patient_id'            => $patient->patient_id,
        'doctor_user_id'        => $doctor->id,
        'booked_by_user_id'     => $userAccount->id,
        'appointment_date'      => now()->addDays(7),
        'start_time'            => '09:00:00',
        'end_time'              => '10:00:00',
        'visit_type'            => 'onsite',
        'reason_for_consultation'=> 'Follow-up session',
        'service_type'          => 'PAC',
        'payment_status'        => 'paid',
        'status'                => 'confirmed', // upcoming
        'notes'                 => null,

        'receipt_paths' => ['receipts/image.png'],
    ]);
}
        }

        // ── 4. Console output ────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('✅ PatientSeeder Complete!');
        $this->command->info('───────────────────────────────────────────────────');
        $this->command->info('✔ Patients linked to EXISTING doctor ID: ' . $doctor->id);
        $this->command->info('═══════════════════════════════════════════════════');
    }
}