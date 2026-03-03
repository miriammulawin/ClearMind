<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Client;
use App\Models\Appointment; 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting database seeding...');

        // ── 1. Admin ───────────────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@clearmind.com'],
            [
                'first_name'   => 'Super',
                'last_name'    => 'Admin',
                'address'      => '123 Admin St, Control City',
                'dob'          => '1990-01-01',
                'sex'          => 'male',
                'contact_no'   => '09000000000',
                'password'     => Hash::make('admin123'),
                'role'         => 'Admin',
            ]
        );

        $this->command->info('Admin created/updated.');

        // ── 2. Main Doctor (your primary test/login account) ──────────────────────
        $mainDoctorUser = User::firstOrCreate(
            ['email' => 'doctor@clearmind.com'],
            [
                'first_name'   => 'Jane',
                'last_name'    => 'Smith',
                'dob'          => '1985-05-15',
                'address'      => '456 Wellness Ave, Healthtown',
                'sex'          => 'female',
                'contact_no'   => '09111111111',
                'password'     => Hash::make('doctor123'),
                'role'         => 'Doctor',
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $mainDoctorUser->id],
            [
                'prc_number'           => 'PSY-0123456',
                'professional_title'   => 'Clinical Psychologist',
                'description'          => 'Experienced therapist specializing in anxiety, depression, and trauma.',
                'years_of_experience'  => 12,
                'license_number'       => 'PRC-1234567',
                'practicing_since'     => '2013',
                'specializations'      => json_encode([
                    'Cognitive Behavioral Therapy',
                    'Trauma-Focused Therapy',
                    'Mindfulness-Based Therapy'
                ]),
                'sub_specializations'  => json_encode([
                    'PTSD',
                    'Panic Disorders',
                    'Grief Counseling'
                ]),
                'board_certificates'   => json_encode([
                    'Diplomate in Clinical Psychology (Philippine Board)',
                    'Certified CBT Therapist'
                ]),
                'services'             => json_encode([
                    'Individual Therapy',
                    'Couples Counseling',
                    'Online/Video Sessions',
                    'Psychological Assessment'
                ]),
                'profile_picture'      => null,
                'certificate_image'    => null,
            ]
        );

        $this->command->info('Main doctor + profile created/updated.');

        // ── 3. 10 Additional Doctors ──────────────────────────────────────────────
        $additionalDoctors = [
            ['first_name' => 'Maria',    'last_name' => 'Santos',     'sex' => 'female', 'dob' => '1980-03-12', 'contact_no' => '09171000001', 'email' => 'maria.santos@clearmind.com'],
            ['first_name' => 'Juan',     'last_name' => 'dela Cruz',  'sex' => 'male',   'dob' => '1975-07-22', 'contact_no' => '09171000002', 'email' => 'juan.delacruz@clearmind.com'],
            ['first_name' => 'Ana',      'last_name' => 'Reyes',      'sex' => 'female', 'dob' => '1988-11-05', 'contact_no' => '09171000003', 'email' => 'ana.reyes@clearmind.com'],
            ['first_name' => 'Carlos',   'last_name' => 'Garcia',     'sex' => 'male',   'dob' => '1982-01-30', 'contact_no' => '09171000004', 'email' => 'carlos.garcia@clearmind.com'],
            ['first_name' => 'Rosa',     'last_name' => 'Mendoza',    'sex' => 'female', 'dob' => '1990-06-18', 'contact_no' => '09171000005', 'email' => 'rosa.mendoza@clearmind.com'],
            ['first_name' => 'Miguel',   'last_name' => 'Torres',     'sex' => 'male',   'dob' => '1978-09-25', 'contact_no' => '09171000006', 'email' => 'miguel.torres@clearmind.com'],
            ['first_name' => 'Luz',      'last_name' => 'Bautista',   'sex' => 'female', 'dob' => '1983-04-14', 'contact_no' => '09171000007', 'email' => 'luz.bautista@clearmind.com'],
            ['first_name' => 'Ramon',    'last_name' => 'Villanueva', 'sex' => 'male',   'dob' => '1986-12-02', 'contact_no' => '09171000008', 'email' => 'ramon.villanueva@clearmind.com'],
            ['first_name' => 'Patricia', 'last_name' => 'Aquino',     'sex' => 'female', 'dob' => '1979-08-09', 'contact_no' => '09171000009', 'email' => 'patricia.aquino@clearmind.com'],
            ['first_name' => 'Eduardo',  'last_name' => 'Castillo',   'sex' => 'male',   'dob' => '1991-02-27', 'contact_no' => '09171000010', 'email' => 'eduardo.castillo@clearmind.com'],
        ];

        foreach ($additionalDoctors as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'first_name'   => $data['first_name'],
                    'last_name'    => $data['last_name'],
                    'dob'          => $data['dob'],
                    'address'      => '123 Main St, Cityville', // Placeholder address for all doctors
                    'sex'          => $data['sex'],
                    'contact_no'   => $data['contact_no'],
                    'password'     => Hash::make('doctor123'),
                    'role'         => 'Doctor',
                ]
            );

            Doctor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'prc_number'           => 'PSY-' . fake()->unique()->numerify('#######'),
                    'professional_title'   => fake()->randomElement([
                        'Clinical Psychologist',
                        'Psychiatrist',
                        'Counseling Psychologist',
                        'Behavioral Therapist',
                        'Neuropsychologist',
                    ]),
                    'description'          => fake()->paragraphs(2, true),
                    'years_of_experience'  => fake()->numberBetween(4, 28),
                    'practicing_since'     => (date('Y') - fake()->numberBetween(4, 28)) . '',
                    'specializations'      => json_encode(fake()->randomElements([
                        'Anxiety Disorders', 'Depression', 'Trauma & PTSD',
                        'Couples Therapy', 'Child Psychology', 'Addiction Counseling'
                    ], fake()->numberBetween(2, 5))),
                ]
            );
        }

        $this->command->info('10 additional doctors + profiles created/updated.');

        // ──  500 Clients ───────────────────────────────────────────────────────
        User::factory()
            ->count(500)
            ->client()                    
            ->create()
            ->each(function ($user) {
               $client =  Client::factory()->create([
                    'user_id'            => $user->id,
                    'appointment_status' => fake()->randomElement([
                        'Pending',
                        'Scheduled',
                        'Cancelled',
                        'Completed'
                    ]),
                ]);
        

         // ── Give each client 1–3 appointments ──────────────────
        $count = fake()->numberBetween(1, 3);
        for ($i = 0; $i < $count; $i++) {
            Appointment::factory()->create([
                'client_id' => $client->id,
            ]);
        }
            });

        $this->command->info('1000 clients + client profiles created.');

        // ── Final summary ─────────────────────────────────────────────────────────
        $this->command->newLine();
        $this->command->info('Seeding completed successfully:');
        $this->command->info('  → Admin:          1');
        $this->command->info('  → Doctors:        11 (with profiles in doctors table)');
        $this->command->info('  → Clients:      1000 (with profiles in clients table)');
        $this->command->newLine();
    }
}