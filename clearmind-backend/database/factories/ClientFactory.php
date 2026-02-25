<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'appointment_status' => $this->faker->randomElement([
                'Pending',
                'Scheduled',
                'Cancelled',
                'Completed',
            ]),
            // you can add more fields later
        ];
    }
}