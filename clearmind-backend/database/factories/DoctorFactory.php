<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'prc_number'          => 'PSY-' . $this->faker->unique()->numerify('#######'),

            'professional_title'  => 'Clinical Psychologist',

            'description'         => $this->faker->paragraph(),

            'years_of_experience' => $this->faker->numberBetween(5, 25),

            'license_number'      => 'PRC-' . $this->faker->unique()->numerify('#########'),

            'practicing_since'    => (string)(date('Y') - $this->faker->numberBetween(5, 20)),

            'profile_picture'     => null,
            
            // NOTE: Relationships should be attached in seeder, not factory
            // The following relationships are now managed through junction tables:
            // - specializations (via doctor_specializations)
            // - sub_specializations (via doctor_sub_specializations)
            // - services (via doctor_services)
            // - board_certificates (via doctor_board_certificates)
        ];
    }

    /**
     * Indicate that the doctor should have all standard relationships attached
     */
    public function withStandardRelationships(): static
    {
        return $this->afterCreating(function ($doctor) {
            // Get or create specializations
            $specialization = \App\Models\Specialization::firstOrCreate(
                ['name' => 'Anxiety Disorders'],
                ['description' => 'Treatment of various anxiety conditions']
            );

            // Attach main specialization
            $doctor->specializations()->attach($specialization->id, ['is_main' => true]);

            // Attach some services
            $service = \App\Models\Service::firstOrCreate(
                ['name' => 'Individual Therapy'],
                ['description' => 'One-on-one counseling sessions']
            );
            $doctor->services()->attach($service->id);
        });
    }
}