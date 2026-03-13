<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Client;
use App\Models\Appointment;
use App\Models\Announcement;
use App\Models\Specialization;
use App\Models\SubSpecialization;
use App\Models\Service;
use App\Models\BoardCertificate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting database seeding...');

        /*
        |--------------------------------------------------------------------------
        | 1. SEED LOOKUP TABLES
        |--------------------------------------------------------------------------
        */
        $this->seedSpecializations();
        $this->seedSubSpecializations();
        $this->seedServices();
        $this->seedBoardCertificates();

        /*
        |--------------------------------------------------------------------------
        | 2. ADMIN
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
        $this->command->info('✓ Admin created/updated.');

        /*
        |--------------------------------------------------------------------------
        | 3. MAIN DOCTOR (doctor@clearmind.com / Jane Smith)
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

        $mainDoctor = Doctor::updateOrCreate(
            ['user_id' => $mainDoctorUser->id],
            [
                'prc_number'          => 'PSY-0123456',
                'professional_title'  => 'Clinical Psychologist',
                'description'         => 'Experienced therapist specializing in anxiety, depression, and trauma.',
                'years_of_experience' => 12,
                'license_number'      => 'PRC-1234567',
                'practicing_since'    => '2013',
                'profile_picture'     => null,
            ]
        );

        $this->attachDoctorRelationships($mainDoctor);
        $this->command->info('✓ Main doctor created.');

        /*
        |--------------------------------------------------------------------------
        | 4. ADDITIONAL 10 DOCTORS
        |--------------------------------------------------------------------------
        */
        $additionalDoctors = [
            ['Maria',    'Santos',     'female', '1980-03-12', '09171000001', 'maria.santos@clearmind.com'],
            ['Juan',     'Dela Cruz',  'male',   '1975-07-22', '09171000002', 'juan.delacruz@clearmind.com'],
            ['Ana',      'Reyes',      'female', '1988-11-05', '09171000003', 'ana.reyes@clearmind.com'],
            ['Carlos',   'Garcia',     'male',   '1982-01-30', '09171000004', 'carlos.garcia@clearmind.com'],
            ['Rosa',     'Mendoza',    'female', '1990-06-18', '09171000005', 'rosa.mendoza@clearmind.com'],
            ['Miguel',   'Torres',     'male',   '1978-09-25', '09171000006', 'miguel.torres@clearmind.com'],
            ['Luz',      'Bautista',   'female', '1983-04-14', '09171000007', 'luz.bautista@clearmind.com'],
            ['Ramon',    'Villanueva', 'male',   '1986-12-02', '09171000008', 'ramon.villanueva@clearmind.com'],
            ['Patricia', 'Aquino',     'female', '1979-08-09', '09171000009', 'patricia.aquino@clearmind.com'],
            ['Eduardo',  'Castillo',   'male',   '1991-02-27', '09171000010', 'eduardo.castillo@clearmind.com'],
        ];

        $otherDoctorIds = [];

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

            $doctor = Doctor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'prc_number'          => 'PSY-' . fake()->unique()->numerify('#######'),
                    'professional_title'  => 'Clinical Psychologist',
                    'description'         => fake()->paragraph(),
                    'years_of_experience' => fake()->numberBetween(5, 20),
                    'license_number'      => 'PRC-' . fake()->unique()->numerify('#########'),
                    'practicing_since'    => (string)(date('Y') - fake()->numberBetween(5, 20)),
                    'profile_picture'     => null,
                ]
            );

            $this->attachDoctorRelationships($doctor);
            $otherDoctorIds[] = $doctor->id;
        }

        $this->command->info('✓ 10 additional doctors created.');

        /*
        |--------------------------------------------------------------------------
        | 5. 500 CLIENTS + APPOINTMENTS
        |--------------------------------------------------------------------------
        | First 200 clients → assigned to main doctor (Jane Smith)
        | Remaining 300 clients → assigned to other doctors randomly
        |--------------------------------------------------------------------------
        */
        $allUsers = User::factory()->count(500)->client()->create();

        foreach ($allUsers->values() as $index => $user) {

            // First 200 go to the main doctor, rest to random other doctors
            $assignedDoctorId = $index < 200
                ? $mainDoctor->id
                : fake()->randomElement($otherDoctorIds);

            $client = Client::factory()->create([
                'user_id'            => $user->id,
                'doctor_id'          => $assignedDoctorId,
                'appointment_status' => fake()->randomElement([
                    'Pending', 'Scheduled', 'Cancelled', 'Completed'
                ]),
            ]);

            $appointmentsCount = fake()->numberBetween(1, 3);

            for ($i = 0; $i < $appointmentsCount; $i++) {
                Appointment::factory()->create([
                    'client_id' => $client->id,
                    'doctor_id' => $assignedDoctorId,
                ]);
            }
        }

        $this->command->info('✓ 500 clients + appointments created (200 assigned to main doctor).');

        /*
        |--------------------------------------------------------------------------
        | 6. TODAY'S APPOINTMENTS (For Dashboard Testing)
        |--------------------------------------------------------------------------
        */
        $this->seedTodayAppointments($mainDoctor->id);

        /*
        |--------------------------------------------------------------------------
        | 7. ANNOUNCEMENTS (NEW)
        |--------------------------------------------------------------------------
        */
        $this->seedAnnouncements($mainDoctor->id, $otherDoctorIds);

        /*
        |--------------------------------------------------------------------------
        | FINAL SUMMARY
        |--------------------------------------------------------------------------
        */
        $this->command->newLine();
        $this->command->info('✓ Seeding completed successfully:');
        $this->command->info('   → Admin:                  1');
        $this->command->info('   → Doctors:               11');
        $this->command->info('   → Main doctor clients:  200');
        $this->command->info('   → Other doctor clients: 300');
        $this->command->info('   → Total clients:        500');
        $this->command->info('   → Appointments:     500-1500 (random)');
        $this->command->info('   → Today\'s Appointments:  20');
        $this->command->info('   → Clinic Announcements:  3');
        $this->command->info('   → Doctor Announcements: 11 (1 per doctor)');
        $this->command->newLine();
    }

    /**
     * Seed announcements for clinic and doctors
     */
    private function seedAnnouncements(int $mainDoctorId, array $otherDoctorIds): void
    {
        // Clinic announcements (created by system, attributed to admin or first doctor)
        $clinicAnnouncements = [
            [
                'title' => 'Clinic Holiday Schedule',
                'message' => 'The clinic will be closed on February 25 in observance of EDSA People Power Anniversary. Please reschedule your appointments accordingly.',
                'priority' => 'urgent',
            ],
            [
                'title' => 'New Online Consultation Hours',
                'message' => 'Starting March 1, online consultations will be available from 8:00 AM to 6:00 PM, Monday to Saturday. Book your slots now!',
                'priority' => 'normal',
            ],
            [
                'title' => 'System Maintenance Notice',
                'message' => 'Our appointment booking system will be undergoing maintenance on March 5 from 2:00 AM to 4:00 AM. Please plan accordingly.',
                'priority' => 'normal',
            ],
        ];

        $firstDoctorId = $mainDoctorId;

        foreach ($clinicAnnouncements as $index => $announcement) {
            Announcement::firstOrCreate(
                [
                    'doctor_id' => $firstDoctorId,
                    'title' => $announcement['title'],
                ],
                [
                    'message' => $announcement['message'],
                    'priority' => $announcement['priority'],
                    'type' => 'clinic',
                    'is_pinned' => $index === 0, // Pin the first one
                ]
            );
        }

        // Doctor-specific announcements (one per doctor)
        $doctorAnnouncements = [
            [
                'title' => 'Office Hours Update',
                'message' => 'Please note that consultation hours for this week have been adjusted. Morning slots start at 9:00 AM instead of 8:00 AM.',
                'priority' => 'normal',
            ],
            [
                'title' => 'New Therapy Techniques Available',
                'message' => 'I\'ve completed advanced training in EMDR therapy and am now offering this service for trauma and PTSD clients.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Virtual Consultation Available',
                'message' => 'I am now accepting virtual consultation requests for existing patients. Book your online session through the app.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Weekend Appointments',
                'message' => 'Due to demand, I am now offering Saturday appointments. Limited slots available - book early!',
                'priority' => 'urgent',
            ],
            [
                'title' => 'Professional Development Update',
                'message' => 'Recently completed certification in Cognitive Behavioral Therapy (CBT). Available for CBT-focused sessions.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Emergency Contact Update',
                'message' => 'Updated emergency protocols. In case of crisis, patients can contact the clinic hotline 24/7.',
                'priority' => 'urgent',
            ],
            [
                'title' => 'Group Therapy Sessions',
                'message' => 'New anxiety management group therapy sessions starting next month. Interest forms available at reception.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Specialized Services',
                'message' => 'Now offering specialized services for adolescent mental health. Parents welcome to attend initial consultation.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Patient Privacy Reminder',
                'message' => 'As part of our commitment to patient privacy, all sessions are now conducted in soundproof consultation rooms.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Continuing Education',
                'message' => 'Completed advanced course in mindfulness-based stress reduction. Now offering MBSR workshops.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Appointment Reminders',
                'message' => 'Automated SMS reminders will now be sent 24 hours before your appointment. Enable notifications in your profile.',
                'priority' => 'normal',
            ],
        ];

        $allDoctorIds = array_merge([$mainDoctorId], $otherDoctorIds);

        foreach ($allDoctorIds as $index => $doctorId) {
            if (isset($doctorAnnouncements[$index])) {
                $announcement = $doctorAnnouncements[$index];

                Announcement::firstOrCreate(
                    [
                        'doctor_id' => $doctorId,
                        'title' => $announcement['title'],
                    ],
                    [
                        'message' => $announcement['message'],
                        'priority' => $announcement['priority'],
                        'type' => 'doctor',
                        'is_pinned' => false,
                    ]
                );
            }
        }

        $this->command->info('✓ Announcements seeded (3 clinic + 11 doctor announcements).');
    }

    /**
     * Seed today's appointments assigned to the main doctor
     */
    private function seedTodayAppointments(int $mainDoctorId): void
    {
        $today = Carbon::now()->toDateString();

        // Only grab clients belonging to the main doctor
        $clients = Client::where('doctor_id', $mainDoctorId)->take(10)->get();

        if ($clients->isEmpty()) {
            $this->command->warn('⚠ No clients found for main doctor. Skipping today\'s appointments.');
            return;
        }

        $times = [
            '08:00:00', '09:00:00', '10:00:00', '11:00:00',
            '13:00:00', '14:00:00', '15:00:00', '16:00:00',
        ];

        $visitTypes = ['Online', 'Physical'];
        $statuses   = ['Pending', 'Scheduled', 'Cancelled', 'Completed'];

        $appointmentIndex = 0;

        foreach ($clients as $client) {
            for ($i = 0; $i < 2; $i++) {
                Appointment::create([
                    'client_id'        => $client->id,
                    'doctor_id'        => $mainDoctorId,
                    'appointment_date' => $today,
                    'appointment_time' => $times[$appointmentIndex % count($times)],
                    'visit_type'       => $visitTypes[$i % count($visitTypes)],
                    'status'           => $statuses[($appointmentIndex + $i) % count($statuses)],
                ]);

                $appointmentIndex++;
            }
        }

        $this->command->info('✓ Today\'s appointments (20 total) created for main doctor.');
    }

    private function seedSpecializations(): void
    {
        $specializations = [
            ['name' => 'Psychological First Aid',     'description' => 'Crisis intervention and immediate support'],
            ['name' => 'Psycho Education',             'description' => 'Education on mental health concepts'],
            ['name' => 'Wellness & Stress Management', 'description' => 'Strategies for stress reduction and wellness'],
            ['name' => 'Workplace Mental Health',      'description' => 'Mental health support in work environments'],
            ['name' => 'Anxiety Disorders',            'description' => 'Treatment of various anxiety conditions'],
            ['name' => 'Depression',                   'description' => 'Therapeutic approaches for depression'],
            ['name' => 'Trauma & PTSD',                'description' => 'Trauma-focused therapy'],
            ['name' => 'Cognitive Behavioral Therapy', 'description' => 'Evidence-based CBT approaches'],
        ];

        foreach ($specializations as $spec) {
            Specialization::firstOrCreate(
                ['name' => $spec['name']],
                ['description' => $spec['description']]
            );
        }

        $this->command->info('✓ Specializations seeded.');
    }

    private function seedSubSpecializations(): void
    {
        $subSpecializations = [
            'Anxiety Disorders' => [
                'Panic Disorder', 'Generalized Anxiety Disorder', 'Social Anxiety', 'Specific Phobias',
            ],
            'Depression' => [
                'Major Depressive Disorder', 'Bipolar Disorder', 'Persistent Depressive Disorder',
            ],
            'Trauma & PTSD' => [
                'PTSD', 'Complex PTSD', 'Grief Counseling',
            ],
            'Cognitive Behavioral Therapy' => [
                'Exposure Therapy', 'Cognitive Restructuring', 'Behavior Activation',
            ],
        ];

        foreach ($subSpecializations as $specName => $subSpecs) {
            $specialization = Specialization::where('name', $specName)->first();
            if ($specialization) {
                foreach ($subSpecs as $subSpecName) {
                    SubSpecialization::firstOrCreate(
                        ['name' => $subSpecName, 'specialization_id' => $specialization->id],
                        ['description' => "Sub-specialization under $specName"]
                    );
                }
            }
        }

        $this->command->info('✓ Sub-specializations seeded.');
    }

    private function seedServices(): void
    {
        $services = [
            ['name' => 'Individual Therapy',      'description' => 'One-on-one counseling sessions'],
            ['name' => 'Couples Therapy',          'description' => 'Relationship counseling'],
            ['name' => 'Online/Video Counseling',  'description' => 'Remote therapy sessions'],
            ['name' => 'Psychological Assessment', 'description' => 'Comprehensive psychological testing'],
            ['name' => 'Group Therapy',            'description' => 'Group-based therapeutic sessions'],
            ['name' => 'Crisis Intervention',      'description' => 'Immediate crisis support'],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['name' => $service['name']],
                ['description' => $service['description']]
            );
        }

        $this->command->info('✓ Services seeded.');
    }

    private function seedBoardCertificates(): void
    {
        $certificates = [
            ['name' => 'Diplomate in Clinical Psychology', 'description' => 'Advanced clinical psychology credential'],
            ['name' => 'Certified CBT Therapist',          'description' => 'Certification in Cognitive Behavioral Therapy'],
            ['name' => 'Registered Psychologist (RPsy)',   'description' => 'State registration as psychologist'],
            ['name' => 'Crisis Intervention Specialist',   'description' => 'Specialized in crisis situations'],
            ['name' => 'Trauma-Focused Specialist',        'description' => 'Specialization in trauma therapy'],
        ];

        foreach ($certificates as $cert) {
            BoardCertificate::firstOrCreate(
                ['name' => $cert['name']],
                ['description' => $cert['description']]
            );
        }

        $this->command->info('✓ Board certificates seeded.');
    }

    private function attachDoctorRelationships(Doctor $doctor): void
    {
        $doctor->specializations()->detach();
        $doctor->subSpecializations()->detach();
        $doctor->services()->detach();
        $doctor->boardCertificates()->detach();

        $mainSpecializations = [
            'Psychological First Aid',
            'Psycho Education',
            'Wellness & Stress Management',
            'Workplace Mental Health',
        ];

        foreach ($mainSpecializations as $index => $specName) {
            $specialization = Specialization::where('name', $specName)->first();
            if ($specialization) {
                $doctor->specializations()->attach(
                    $specialization->id,
                    ['is_main' => $index === 0]
                );
            }
        }

        $secondarySpecializations = [
            'Anxiety Disorders', 'Depression', 'Trauma & PTSD', 'Cognitive Behavioral Therapy',
        ];

        foreach ($secondarySpecializations as $specName) {
            $specialization = Specialization::where('name', $specName)->first();
            if ($specialization) {
                $doctor->specializations()->attach($specialization->id, ['is_main' => false]);
            }
        }

        $subSpecializations = ['Panic Disorder', 'Grief Counseling', 'Stress Management', 'PTSD'];

        foreach ($subSpecializations as $subSpecName) {
            $subSpecialization = SubSpecialization::where('name', $subSpecName)->first();
            if ($subSpecialization) {
                $doctor->subSpecializations()->attach($subSpecialization->id);
            }
        }

        $serviceNames = [
            'Individual Therapy', 'Couples Therapy', 'Online/Video Counseling', 'Psychological Assessment',
        ];

        foreach ($serviceNames as $serviceName) {
            $service = Service::where('name', $serviceName)->first();
            if ($service) {
                $doctor->services()->attach($service->id);
            }
        }

        $certificateNames = [
            'Diplomate in Clinical Psychology',
            'Certified CBT Therapist',
            'Registered Psychologist (RPsy)',
        ];

        foreach ($certificateNames as $certName) {
            $certificate = BoardCertificate::where('name', $certName)->first();
            if ($certificate) {
                $doctor->boardCertificates()->attach(
                    $certificate->id,
                    [
                        'certificate_number' => 'CERT-' . fake()->numerify('########'),
                        'issued_date'        => now()->subYears(fake()->numberBetween(3, 8))->toDateString(),
                        'expiry_date'        => now()->addYears(fake()->numberBetween(1, 5))->toDateString(),
                    ]
                );
            }
        }
    }
}