<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\AssessmentPurpose;
class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Intake Consultation (first — required for new patients)
        Service::create([
            'service_name' => 'Intake Consultation',
            'description'  => 'An initial meeting to gather information about the patient\'s concerns, background, and needs to determine the appropriate course of care.',
            'price'        => 500,
            'is_available' => true,
        ]);

        // Psychotherapy
        Service::create([
            'service_name' => 'Psychotherapy and Counseling',
            'description'  => 'Helps individuals understand and manage their thoughts, emotions, and behaviors in a healthy way.',
            'price'        => 1000,
            'is_available' => true,
        ]);

        // Psychological Assessment
        $assessment = Service::create([
            'service_name' => 'Psychological Assessment and Evaluation',
            'description'  => 'Gathers and integrates data about a person\'s mental, emotional, cognitive, behavioral, personality, and social functioning.',
            'price'        => 1000,
            'is_available' => true,
        ]);

        // Purposes
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
            AssessmentPurpose::create([
                'service_id'   => $assessment->service_id,
                'purpose_name' => $p,
                'price'        => 500,
                'is_active'    => true,
            ]);
        }

        // Psychiatric Evaluation
        Service::create([
            'service_name' => 'Psychiatric Evaluation',
            'description'  => 'A comprehensive assessment conducted by a psychiatrist to diagnose mental health conditions and determine appropriate treatment plans.',
            'price'        => 1500,
            'is_available' => true,
        ]);
    }
}