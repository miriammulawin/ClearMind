<?php

namespace Database\Factories;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'doctor_id' => Doctor::inRandomOrder()->first()?->id,  // ← ADDED
            'appointment_status' => $this->faker->randomElement([
                'Pending',
                'Scheduled',
                'Cancelled',
                'Completed',
            ]),
        ];
    }
}