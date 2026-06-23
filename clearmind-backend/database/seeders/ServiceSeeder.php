<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\AssessmentPurpose;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Psychotherapy
        Service::updateOrCreate(
            ['service_name' => 'Psychotherapy'],
            [
                'description' => 'Helps individuals understand and manage their thoughts, emotions, and behaviors in a healthy way.',
                'price' => 1000,
                'is_available' => true,
            ]
        );

        // 2. Psychological Assessment
        Service::updateOrCreate(
            ['service_name' => 'Psychological Assessment'],
            [
                'description' => 'Gathers and integrates data about a person\'s mental, emotional, cognitive, behavioral, personality, and social functioning.',
                'price' => 1000,
                'is_available' => true,
            ]
        );

        // 3. Psychiatric Evaluation
        Service::updateOrCreate(
            ['service_name' => 'Psychiatric Evaluation'],
            [
                'description' => 'A clinical evaluation conducted by a psychiatrist to diagnose and manage mental health conditions, including medication management when needed.',
                'price' => 1000,
                'is_available' => true,
            ]
        );

        // 4. Mental Health Certification (has sub-purposes)
        $certification = Service::updateOrCreate(
            ['service_name' => 'Mental Health Certification'],
            [
                'description' => 'Issuance of certification for various legal, academic, employment, or support purposes.',
                'price' => 500,
                'is_available' => true,
            ]
        );

        // Purposes under Mental Health Certification
        $purposes = [
            'VAWC Purpose',
            'Adoption or Other Legal Purposes',
            'School / Academic Support',
            'Work-related Purpose',
            'Pre-Employment Purpose',
            'Emotional Support Animal (ESA) Certification',
            'Mental Health Certification',
        ];

        foreach ($purposes as $p) {
            AssessmentPurpose::updateOrCreate(
                [
                    'service_id' => $certification->service_id,
                    'purpose_name' => $p,
                ],
                [
                    'price' => 500,
                    'is_active' => true,
                ]
            );
        }
    }
}