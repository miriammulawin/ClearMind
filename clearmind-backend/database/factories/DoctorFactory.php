<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorFactory extends Factory
{
    public function definition(): array
    {
        return [

            'prc_number'          => 'PSY-' . $this->faker->unique()->numerify('#######'),

            'professional_title'  => 'Clinical Psychologist',

            'description'         => 'Experienced mental health professional specializing in therapy and psychological assessment.',

            'years_of_experience' => 10,

            'license_number'      => 'PRC-' . $this->faker->unique()->numerify('#########'),

            'practicing_since'    => '2014',

            //  SAME FOR ALL DOCTORS
            'main_specializations' => json_encode([
                'Psychological First Aid',
                'Psycho Education',
                'Wellness & Stress Management',
                'Workplace Mental Health'
            ]),

            'specializations' => json_encode([
                'Anxiety Disorders',
                'Depression',
                'Trauma & PTSD',
                'Cognitive Behavioral Therapy'
            ]),

            'sub_specializations' => json_encode([
                'Panic Disorder',
                'OCD',
                'Grief Counseling',
                'Stress Management'
            ]),

            'board_certificates' => json_encode([
                'Diplomate in Clinical Psychology',
                'Certified CBT Therapist',
                'Registered Psychologist (RPsy)'
            ]),

            'services' => json_encode([
                'Individual Therapy',
                'Couples Therapy',
                'Online/Video Counseling',
                'Psychological Assessment'
            ]),

            'profile_picture'   => null,
            'certificate_image' => null,
        ];
    }
}