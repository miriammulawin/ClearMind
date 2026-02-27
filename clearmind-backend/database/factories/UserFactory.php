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
            'first_name'   => $this->faker->firstName(),
            'last_name'    => $this->faker->lastName(),
            'dob'          => $this->faker->dateTimeBetween('1970-01-01', '2005-01-01')->format('Y-m-d'),
            'sex'          => $this->faker->randomElement(['male', 'female']),
            'contact_no'   => '09' . $this->faker->numerify('#########'),
            'email'        => $this->faker->unique()->safeEmail(),
            'password'     => static::$password ??= Hash::make('client123'),
            'role'         => 'Client',           
            'is_active'    => true,
            'created_at'   => $createdAt,
            'updated_at'   => $createdAt,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    // Optional states for different roles
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'Admin',
            'email' => 'admin@clearmind.com',
        ]);
    }

    public function doctor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'Doctor',
        ]);
    }

    public function client(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'Client',
        ]);
    }
}