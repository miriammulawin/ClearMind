<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\AssessmentPurpose;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Psychotherapy
        Service::create([
            'service_name' => 'Psychotherapy and Counseling',
            'description' => 'Helps individuals understand and manage their thoughts, emotions, and behaviors in a healthy way.',
            'price' => 1000,
            'is_available' => true,
          
        ]);

        // Psychological Assessment
        $assessment = Service::create([
            'service_name' => 'Psychological Assessment and Evaluation',
            'description' => 'Gathers and integrates data about a person\'s mental, emotional, cognitive, behavioral, personality, and social functioning.',
            'price' => 1000,
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
                'service_id' => $assessment->service_id,
                'purpose_name' => $p,
                'price' => 500,
                'is_active' => true,
            ]);
        }
    }
}