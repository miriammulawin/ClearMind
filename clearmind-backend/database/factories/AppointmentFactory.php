<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $createdAt = $this->faker->dateTimeBetween(
            date('Y') . '-01-01',
            date('Y') . '-12-31'
        );

        return [
            'appointment_date' => $this->faker->dateTimeBetween(
                date('Y') . '-01-01',
                date('Y') . '-12-31'
            )->format('Y-m-d'),
            'appointment_time' => $this->faker->randomElement([
                '08:00:00', '09:00:00', '10:00:00', '11:00:00',
                '13:00:00', '14:00:00', '15:00:00', '16:00:00',
            ]),
            'visit_type' => $this->faker->randomElement(['Online', 'Physical']),
            'status'     => $this->faker->randomElement([
                'Pending', 'Scheduled', 'Cancelled', 'Completed',
            ]),
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}