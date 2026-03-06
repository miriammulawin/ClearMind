<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = $this->faker->dateTimeBetween(
            date('Y') . '-01-01',
            date('Y') . '-12-31'
        );

        return [
            'doctor_id' => \App\Models\Doctor::inRandomOrder()->first()->id,
            
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