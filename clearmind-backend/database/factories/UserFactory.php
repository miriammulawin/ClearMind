<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

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
        'first_name'         => $this->faker->firstName,
        'last_name'          => $this->faker->lastName,
        'dob'                => $this->faker->dateTimeBetween('1970-01-01', '2005-01-01')->format('Y-m-d'),
        'sex'                => $this->faker->randomElement(['male', 'female']),
        'contact_no'         => '09' . $this->faker->numerify('#########'),
        'email'              => $this->faker->unique()->safeEmail,
        'password'           => Hash::make('client123'),
        'role'               => 'Client',
        'appointment_status' => $this->faker->randomElement(['Scheduled', 'Cancelled', 'Pending']),
        'created_at'         => $createdAt,
        'updated_at'         => $createdAt,
    ];
}

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
