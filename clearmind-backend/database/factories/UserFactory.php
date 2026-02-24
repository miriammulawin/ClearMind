<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        $createdAt = $this->faker->dateTimeBetween(
            date('Y') . '-01-01',
            date('Y') . '-12-31'
        );

        return [
            'first_name'         => $this->faker->firstName,
            'last_name'          => $this->faker->lastName,
            'dob'                => $this->faker->dateTimeBetween('1970-01-01', '2005-01-01')->format('Y-m-d'),
            'sex'                => $this->faker->randomElement(['male', 'female']),
            'contact_no'         => '09' . $this->faker->numerify('#########'),
            'email'              => $this->faker->unique()->safeEmail,
            'password'           => Hash::make('client123'),
            'role'               => 'Client',
            'appointment_status' => $this->faker->randomElement(['Scheduled', 'Cancelled', 'Pending']),
            'prc_number'         => null, // Default to null for clients
            'created_at'         => $createdAt,
            'updated_at'         => $createdAt,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}