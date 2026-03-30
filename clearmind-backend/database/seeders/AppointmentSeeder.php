<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\ConsultationRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        $patients = User::where('role', User::ROLE_CLIENT)->get();
        $doctors  = User::where('role', User::ROLE_DOCTOR)->get();

        if ($patients->isEmpty() || $doctors->isEmpty()) {
            $this->command->warn('No patients or doctors found. Run UserSeeder first.');
            return;
        }

        $types    = ['online', 'physical'];
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
        $reasons  = [
            'Initial psychiatric evaluation',
            'Follow-up therapy session',
            'Anxiety management consultation',
            'Depression screening',
            'Stress and burnout assessment',
            'Relationship counseling',
            'Grief and loss support',
            'ADHD evaluation',
            'Sleep disorder consultation',
            'Medication review',
        ];

        $urgencies = ['low', 'normal', 'high', 'emergency'];
        $concerns  = [
            'Experiencing severe anxiety attacks daily',
            'Cannot sleep for more than 3 hours',
            'Feeling hopeless and withdrawing from family',
            'Panic attacks at work affecting performance',
            'Need follow-up on previous medication',
            'Experiencing mood swings and irritability',
            'Struggling with intrusive thoughts',
            'Burnout from work stress',
            'Grieving loss of a loved one',
            'Child behavior concerns',
        ];

        $currentYear = (int) date('Y');

        // ── Seed 200 Appointments spread across the year ──
        $this->command->info('Seeding appointments...');

        for ($i = 1; $i <= 200; $i++) {
            $patient = $faker->randomElement($patients->all());
            $doctor  = $faker->randomElement($doctors->all());

            // Spread across all 12 months round-robin
            $month   = (($i - 1) % 12) + 1;
            $lastDay = (int) date('t', mktime(0, 0, 0, $month, 1, $currentYear));
            $day     = $faker->numberBetween(1, $lastDay);
            $date    = sprintf('%04d-%02d-%02d', $currentYear, $month, $day);

            // Appointments in the past are completed/cancelled, future = pending/confirmed
            $isPast  = strtotime($date) < time();
            if ($isPast) {
                $status = $faker->randomElement(['completed', 'cancelled', 'no_show', 'completed', 'completed']);
            } else {
                $status = $faker->randomElement(['pending', 'confirmed', 'pending']);
            }

            $hour   = $faker->numberBetween(8, 17);
            $minute = $faker->randomElement(['00', '30']);
            $time   = sprintf('%02d:%s:00', $hour, $minute);

            $appointment = new Appointment();
            $appointment->fill([
                'patient_id'       => $patient->id,
                'doctor_id'        => $doctor->id,
                'appointment_date' => $date,
                'appointment_time' => $time,
                'type'             => $faker->randomElement($types),
                'status'           => $status,
                'reason'           => $faker->randomElement($reasons),
                'notes'            => $faker->optional(0.4)->sentence(),
                'cancellation_reason' => $status === 'cancelled'
                    ? $faker->randomElement([
                        'Patient requested reschedule',
                        'Doctor unavailable',
                        'Emergency situation',
                        'No reason provided',
                    ])
                    : null,
            ]);
            $appointment->timestamps = false;
            $appointment->created_at = $faker->dateTimeBetween("{$currentYear}-01-01", $date);
            $appointment->updated_at = $appointment->created_at;
            $appointment->save();

            if ($i % 50 === 0) {
                $this->command->info("Created {$i} appointments...");
            }
        }

        // ── Seed 60 Consultation Requests ──
        $this->command->info('Seeding consultation requests...');

        for ($i = 1; $i <= 60; $i++) {
            $patient = $faker->randomElement($patients->all());
            $doctor  = $faker->optional(0.5)->randomElement($doctors->all());

            // Mix of statuses — mostly pending so dashboard shows them
            $status = $faker->randomElement([
                'pending', 'pending', 'pending',
                'reviewed', 'approved', 'rejected',
            ]);

            $preferredDate = $faker->optional(0.7)
                ->dateTimeBetween('now', '+30 days')
                ?->format('Y-m-d');

            $request = new ConsultationRequest();
            $request->fill([
                'patient_id'     => $patient->id,
                'doctor_id'      => $doctor?->id,
                'concern'        => $faker->randomElement($concerns),
                'urgency'        => $faker->randomElement($urgencies),
                'preferred_date' => $preferredDate,
                'preferred_time' => $faker->optional(0.6)->randomElement([
                    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00',
                ]),
                'type'           => $faker->randomElement(['online', 'physical', 'any']),
                'status'         => $status,
                'admin_notes'    => in_array($status, ['reviewed', 'approved', 'rejected'])
                    ? $faker->optional(0.7)->sentence()
                    : null,
            ]);
            $request->timestamps = false;
            $request->created_at = $faker->dateTimeBetween('-30 days', 'now');
            $request->updated_at = $request->created_at;
            $request->save();
        }

        $this->command->info('');
        $this->command->info('AppointmentSeeder complete!');
        $this->command->info('   • 200 Appointments (spread Jan–Dec)');
        $this->command->info('   • 60 Consultation Requests (mixed statuses)');
    }
}