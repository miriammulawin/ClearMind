<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Doctor>
 */
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
            'prc_number'           => 'PSY-' . $this->faker->unique()->numerify('#######'),
            'professional_title'   => $this->faker->randomElement([
                'Clinical Psychologist',
                'Psychiatrist',
                'Counseling Psychologist',
                'Therapist',
                'Behavioral Therapist',
                'Neuropsychologist',
            ]),
            'description'          => $this->faker->paragraphs(2, true),
            'years_of_experience'  => $this->faker->numberBetween(3, 28),
            'license_number'       => 'PRC-' . $this->faker->numerify('#########'),
            'practicing_since'     => $this->faker->numberBetween(1995, date('Y') - 2),
            'specializations'      => json_encode($this->faker->randomElements([
                'Anxiety Disorders',
                'Depression',
                'Trauma & PTSD',
                'Couples Therapy',
                'Child & Adolescent',
                'Cognitive Behavioral Therapy',
                'Mindfulness-Based Therapy',
                'Addiction Counseling',
            ], $this->faker->numberBetween(2, 6))),
            'sub_specializations'  => json_encode($this->faker->randomElements([
                'Panic Disorder',
                'OCD',
                'Grief Counseling',
                'Stress Management',
                'Anger Management',
            ], $this->faker->numberBetween(0, 4))),
            'board_certificates'   => json_encode($this->faker->randomElements([
                'Diplomate in Clinical Psychology',
                'Certified CBT Therapist',
                'Registered Psychologist (RPsy)',
                'Certified Trauma Specialist',
            ], $this->faker->numberBetween(1, 3))),
            'services'             => json_encode($this->faker->randomElements([
                'Individual Therapy',
                'Online/Video Counseling',
                'Couples Session',
                'Group Therapy',
                'Psychological Assessment',
                'Family Therapy',
            ], $this->faker->numberBetween(2, 6))),
            'profile_picture'      => null,
            'certificate_image'    => null,
        ];
    }
}