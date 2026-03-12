<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        // Pull a random client that already has a doctor assigned
        $client = Client::whereNotNull('doctor_id')->inRandomOrder()->first();

        return [
            'client_id'        => $client?->id ?? Client::factory(),
            'doctor_id'        => $client?->doctor_id,  
            'appointment_date' => fake()->dateTimeBetween('-6 months', '+3 months'),
            'appointment_time' => fake()->time('H:i:s'),
            'visit_type'       => fake()->randomElement(['Online', 'Physical']),
            'status'           => fake()->randomElement(['Pending', 'Scheduled', 'Cancelled', 'Completed']),
        ];
    }
}