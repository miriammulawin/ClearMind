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

        // Client user
        User::firstOrCreate(
            ['email' => 'client@clearmind.com'],
            [
                'first_name' => 'John',
                'last_name'  => 'Doe',
                'dob'        => '2000-03-20',
                'sex'        => 'male',
                'contact_no' => '09222222222',
                'password'   => Hash::make('client123'),
                'role'       => 'Client',
            ]
        );

        $this->command->info('Seed users created successfully!');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin',  'admin@clearmind.com',  'admin123'],
                ['Doctor', 'doctor@clearmind.com', 'doctor123'],
                ['Client', 'client@clearmind.com', 'client123'],
            ]
        );
    }
}