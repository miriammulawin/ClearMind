<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@clearmind.com'],
            [
                'firstName'     => 'System',
                'lastName'      => 'Admin',
                'middleInitial' => 'A',
                'dob'           => '1990-01-01',
                'sex'           => 'male',
                'contactNo'     => '09000000001',
                'email'         => 'admin@clearmind.com',
                'password'      => Hash::make('admin123'),
                'role'          => User::ROLE_ADMIN,
                'is_active'     => true,
            ]
        );

        // ── Doctor ─────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'doctor@clearmind.com'],
            [
                'firstName'     => 'Maria',
                'lastName'      => 'Santos',
                'middleInitial' => 'L',
                'dob'           => '1985-06-15',
                'sex'           => 'female',
                'contactNo'     => '09000000002',
                'email'         => 'doctor@clearmind.com',
                'password'      => Hash::make('doctor123'),
                'role'          => User::ROLE_DOCTOR,
                'is_active'     => true,
            ]
        );

        // ── Client ─────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'client@clearmind.com'],
            [
                'firstName'     => 'Juan',
                'lastName'      => 'Dela Cruz',
                'middleInitial' => 'M',
                'dob'           => '2000-03-20',
                'sex'           => 'male',
                'contactNo'     => '09000000003',
                'email'         => 'client@clearmind.com',
                'password'      => Hash::make('client123'),
                'role'          => User::ROLE_CLIENT,
                'is_active'     => true,
            ]
        );

        $this->command->info('Seeded: Admin, Doctor, Client accounts.');
    }
}