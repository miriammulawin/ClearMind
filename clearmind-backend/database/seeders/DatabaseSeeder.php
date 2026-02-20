<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::firstOrCreate(
            ['email' => 'admin@clearmind.com'],
            [
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'dob'        => '1990-01-01',
                'sex'        => 'male',
                'contact_no' => '09000000000',
                'password'   => Hash::make('admin123'),
                'role'       => 'Admin',
            ]
        );

        // Doctor user
        User::firstOrCreate(
            ['email' => 'doctor@clearmind.com'],
            [
                'first_name' => 'Jane',
                'last_name'  => 'Smith',
                'dob'        => '1985-05-15',
                'sex'        => 'female',
                'contact_no' => '09111111111',
                'password'   => Hash::make('doctor123'),
                'role'       => 'Doctor',
            ]
        );



    User::factory()->count(1000)->create();
    $this->command->info('Admin, Doctor, and 1000 Clients created successfully!');
    }
}