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

        /*
        |--------------------------------------------------------------------------
        | SHARED DOCTOR DATA (Same For All Doctors)
        |--------------------------------------------------------------------------
        */

        $sharedDoctorData = [
            'main_specializations' => json_encode([
                'Psychological First Aid',
                'Psycho Education',
                'Wellness & Stress Management',
                'Workplace Mental Health',
            ]),

            'specializations' => json_encode([
                'Anxiety Disorders',
                'Depression',
                'Trauma & PTSD',
                'Cognitive Behavioral Therapy',
            ]),

            'sub_specializations' => json_encode([
                'Panic Disorder',
                'OCD',
                'Grief Counseling',
                'Stress Management',
            ]),

            'board_certificates' => json_encode([
                'Diplomate in Clinical Psychology',
                'Certified CBT Therapist',
                'Registered Psychologist (RPsy)',
            ]),

            'services' => json_encode([
                'Individual Therapy',
                'Couples Therapy',
                'Online/Video Counseling',
                'Psychological Assessment',
            ]),
        ];

        /*
        |--------------------------------------------------------------------------
        | 1. ADMIN
        |--------------------------------------------------------------------------
        */

        User::firstOrCreate(
            ['email' => 'admin@clearmind.com'],
            [
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'address'    => '123 Admin St, Control City',
                'dob'        => '1990-01-01',
                'sex'        => 'male',
                'contact_no' => '09000000000',
                'password'   => Hash::make('admin123'),
                'role'       => 'Admin',
            ]
        );

        $this->command->info('Admin created/updated.');

        /*
        |--------------------------------------------------------------------------
        | 2. MAIN DOCTOR
        |--------------------------------------------------------------------------
        */

        $mainDoctorUser = User::firstOrCreate(
            ['email' => 'doctor@clearmind.com'],
            [
                'first_name' => 'Jane',
                'last_name'  => 'Smith',
                'dob'        => '1985-05-15',
                'address'    => '456 Wellness Ave, Healthtown',
                'sex'        => 'female',
                'contact_no' => '09111111111',
                'password'   => Hash::make('doctor123'),
                'role'       => 'Doctor',
            ]
        );

        Doctor::updateOrCreate(
            ['user_id' => $mainDoctorUser->id],
            array_merge([
                'prc_number'          => 'PSY-0123456',
                'professional_title'  => 'Clinical Psychologist',
                'description'         => 'Experienced therapist specializing in anxiety, depression, and trauma.',
                'years_of_experience' => 12,
                'license_number'      => 'PRC-1234567',
                'practicing_since'    => '2013',
                'profile_picture'     => null,
                'certificate_image'   => null,
            ], $sharedDoctorData)
        );

        $this->command->info('Main doctor created/updated.');

        /*
        |--------------------------------------------------------------------------
        | 3. ADDITIONAL 10 DOCTORS (Same Specializations)
        |--------------------------------------------------------------------------
        */

        $additionalDoctors = [
            ['Maria','Santos','female','1980-03-12','09171000001','maria.santos@clearmind.com'],
            ['Juan','Dela Cruz','male','1975-07-22','09171000002','juan.delacruz@clearmind.com'],
            ['Ana','Reyes','female','1988-11-05','09171000003','ana.reyes@clearmind.com'],
            ['Carlos','Garcia','male','1982-01-30','09171000004','carlos.garcia@clearmind.com'],
            ['Rosa','Mendoza','female','1990-06-18','09171000005','rosa.mendoza@clearmind.com'],
            ['Miguel','Torres','male','1978-09-25','09171000006','miguel.torres@clearmind.com'],
            ['Luz','Bautista','female','1983-04-14','09171000007','luz.bautista@clearmind.com'],
            ['Ramon','Villanueva','male','1986-12-02','09171000008','ramon.villanueva@clearmind.com'],
            ['Patricia','Aquino','female','1979-08-09','09171000009','patricia.aquino@clearmind.com'],
            ['Eduardo','Castillo','male','1991-02-27','09171000010','eduardo.castillo@clearmind.com'],
        ];

        foreach ($additionalDoctors as $doc) {

            $user = User::firstOrCreate(
                ['email' => $doc[5]],
                [
                    'first_name' => $doc[0],
                    'last_name'  => $doc[1],
                    'dob'        => $doc[3],
                    'address'    => '123 Main St, Cityville',
                    'sex'        => $doc[2],
                    'contact_no' => $doc[4],
                    'password'   => Hash::make('doctor123'),
                    'role'       => 'Doctor',
                ]
            );

            Doctor::updateOrCreate(
                ['user_id' => $user->id],
                array_merge([
                    'prc_number'          => 'PSY-' . fake()->unique()->numerify('#######'),
                    'professional_title'  => 'Clinical Psychologist',
                    'description'         => fake()->paragraph(),
                    'years_of_experience' => fake()->numberBetween(5, 20),
                    'license_number'      => 'PRC-' . fake()->unique()->numerify('#########'),
                    'practicing_since'    => (date('Y') - fake()->numberBetween(5, 20)),
                    'profile_picture'     => null,
                    'certificate_image'   => null,
                ], $sharedDoctorData)
            );
        }

        $this->command->info('10 additional doctors created.');

        /*
        |--------------------------------------------------------------------------
        | 4. 500 CLIENTS + APPOINTMENTS
        |--------------------------------------------------------------------------
        */

        User::factory()
            ->count(500)
            ->client()
            ->create()
            ->each(function ($user) {

                $client = Client::factory()->create([
                    'user_id' => $user->id,
                    'appointment_status' => fake()->randomElement([
                        'Pending','Scheduled','Cancelled','Completed'
                    ]),
                ]);

                $appointmentsCount = fake()->numberBetween(1, 3);

                for ($i = 0; $i < $appointmentsCount; $i++) {
                    Appointment::factory()->create([
                        'client_id' => $client->id,
                    ]);
                }
            });

        $this->command->info('500 clients + appointments created.');

        /*
        |--------------------------------------------------------------------------
        | FINAL SUMMARY
        |--------------------------------------------------------------------------
        */

        $this->command->newLine();
        $this->command->info('Seeding completed successfully:');
        $this->command->info('  → Admin:   1');
        $this->command->info('  → Doctors: 11');
        $this->command->info('  → Clients: 500');
        $this->command->newLine();
    }
}