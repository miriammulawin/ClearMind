<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ────────────────────────────────────────────────────
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

        // ── Main Doctor (your login account) ─────────────────────────
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
                'prc_number' => 'PSY-0123456',
            ]
        );

        // ── 10 Additional Doctors with randomized PRC numbers ─────────
        $doctors = [
            ['first_name' => 'Maria',    'last_name' => 'Santos',     'sex' => 'female', 'dob' => '1980-03-12', 'contact_no' => '09171000001', 'email' => 'maria.santos@clearmind.com'],
            ['first_name' => 'Juan',     'last_name' => 'dela Cruz',  'sex' => 'male',   'dob' => '1975-07-22', 'contact_no' => '09171000002', 'email' => 'juan.delacruz@clearmind.com'],
            ['first_name' => 'Ana',      'last_name' => 'Reyes',      'sex' => 'female', 'dob' => '1988-11-05', 'contact_no' => '09171000003', 'email' => 'ana.reyes@clearmind.com'],
            ['first_name' => 'Carlos',   'last_name' => 'Garcia',     'sex' => 'male',   'dob' => '1982-01-30', 'contact_no' => '09171000004', 'email' => 'carlos.garcia@clearmind.com'],
            ['first_name' => 'Rosa',     'last_name' => 'Mendoza',    'sex' => 'female', 'dob' => '1990-06-18', 'contact_no' => '09171000005', 'email' => 'rosa.mendoza@clearmind.com'],
            ['first_name' => 'Miguel',   'last_name' => 'Torres',     'sex' => 'male',   'dob' => '1978-09-25', 'contact_no' => '09171000006', 'email' => 'miguel.torres@clearmind.com'],
            ['first_name' => 'Luz',      'last_name' => 'Bautista',   'sex' => 'female', 'dob' => '1983-04-14', 'contact_no' => '09171000007', 'email' => 'luz.bautista@clearmind.com'],
            ['first_name' => 'Ramon',    'last_name' => 'Villanueva', 'sex' => 'male',   'dob' => '1986-12-02', 'contact_no' => '09171000008', 'email' => 'ramon.villanueva@clearmind.com'],
            ['first_name' => 'Patricia', 'last_name' => 'Aquino',     'sex' => 'female', 'dob' => '1979-08-09', 'contact_no' => '09171000009', 'email' => 'patricia.aquino@clearmind.com'],
            ['first_name' => 'Eduardo',  'last_name' => 'Castillo',   'sex' => 'male',   'dob' => '1991-02-27', 'contact_no' => '09171000010', 'email' => 'eduardo.castillo@clearmind.com'],
        ];

        foreach ($doctors as $doctor) {
            User::firstOrCreate(
                ['email' => $doctor['email']],
                [
                    'first_name' => $doctor['first_name'],
                    'last_name'  => $doctor['last_name'],
                    'dob'        => $doctor['dob'],
                    'sex'        => $doctor['sex'],
                    'contact_no' => $doctor['contact_no'],
                    'password'   => Hash::make('doctor123'),
                    'role'       => 'Doctor',
                    'prc_number' => 'PSY-' . rand(1000000, 9999999),
                ]
            );
        }

        // ── 1000 Clients ─────────────────────────────────────────────
        User::factory()->count(1000)->create();

        $this->command->info('Admin, 11 Doctors with PRC numbers, and 1000 Clients created!');
    }
}