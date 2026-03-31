<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // ── CORE ACCOUNTS ──────────────────────────────────

        // Admin
        User::updateOrCreate(
            ['email' => 'admin@clearmind.com'],
            [
                'firstName'        => 'System',
                'lastName'         => 'Admin',
                'middleInitial'    => 'A',
                'dob'              => '1990-01-01',
                'sex'              => 'male',
                'genderIdentity'   => 'male',
                'preferredPronoun' => 'he_him',
                'contactNo'        => '09000000001',
                'email'            => 'admin@clearmind.com',
                'password'         => Hash::make('admin123'),
                'role'             => User::ROLE_ADMIN,
                'is_active'        => true,
            ]
        );

        // Doctor 1
        User::updateOrCreate(
            ['email' => 'doctor@clearmind.com'],
            [
                'firstName'        => 'Maria',
                'lastName'         => 'Santos',
                'middleInitial'    => 'L',
                'dob'              => '1985-06-15',
                'sex'              => 'female',
                'genderIdentity'   => 'female',
                'preferredPronoun' => 'she_her',
                'contactNo'        => '09000000002',
                'email'            => 'doctor@clearmind.com',
                'password'         => Hash::make('doctor123'),
                'role'             => User::ROLE_DOCTOR,
                'is_active'        => true,
            ]
        );

        // Doctor 2
        User::updateOrCreate(
            ['email' => 'doctor2@clearmind.com'],
            [
                'firstName'        => 'John',
                'lastName'         => 'Reyes',
                'middleInitial'    => 'P',
                'dob'              => '1988-03-22',
                'sex'              => 'male',
                'genderIdentity'   => 'male',
                'preferredPronoun' => 'he_him',
                'contactNo'        => '09000000002',
                'email'            => 'doctor2@clearmind.com',
                'password'         => Hash::make('doctor123'),
                'role'             => User::ROLE_DOCTOR,
                'is_active'        => true,
            ]
        );

        // Doctor 3
        User::updateOrCreate(
            ['email' => 'doctor3@clearmind.com'],
            [
                'firstName'        => 'Angela',
                'lastName'         => 'Montoya',
                'middleInitial'    => 'C',
                'dob'              => '1987-11-10',
                'sex'              => 'female',
                'genderIdentity'   => 'female',
                'preferredPronoun' => 'she_her',
                'contactNo'        => '09000000003',
                'email'            => 'doctor3@clearmind.com',
                'password'         => Hash::make('doctor123'),
                'role'             => User::ROLE_DOCTOR,
                'is_active'        => true,
            ]
        );

        // ── 10 RANDOM CLIENTS ────────────────────────────

        $firstNames = [
            'Maria', 'Juan', 'Jose', 'Ana', 'Miguel', 'Rosa', 'Francisco', 'Lucia',
            'Antonio', 'Carmen', 'Carlos', 'Juana', 'Manuel', 'Margarita', 'Pedro', 'Theresa',
            'Diego', 'Isabel', 'Luis', 'Francisca', 'Ramon', 'Magdalena', 'Salvador', 'Josefa',
            'Angel', 'Consolacion', 'Gabriel', 'Esperanza', 'Rafael', 'Purita', 'Enrique', 'Leonora',
            'Domingo', 'Filomena', 'Fernando', 'Erlinda', 'Gonzalo', 'Amelia', 'Mariano', 'Catalina',
            'Alexander', 'Evangeline', 'Benjamin', 'Ophelia', 'Ricardo', 'Benilda', 'Alfredo', 'Melinda',
            'Arnaldo', 'Petra', 'Arsenio', 'Natividad', 'Aurelio', 'Otelia', 'Basilio', 'Pompeya',
            'Benilson', 'Purificacion', 'Caetano', 'Quirina', 'Calvino', 'Rufina', 'Casimiro', 'Sabina',
            'Cecilio', 'Santana', 'Celestino', 'Tomasa', 'Celedonio', 'Transito', 'Cenon', 'Usita',
            'Cesareo', 'Valentina', 'Cipriano', 'Venancia', 'Cirilo', 'Verdiana', 'Claudio', 'Victorina',
            'Clement', 'Vincenta', 'Clemente', 'Violeta', 'Cornelio', 'Vivencia', 'Cosme', 'Ysabel',
            'Cristino', 'Zenaida', 'Damaso', 'Alexandra', 'Damian', 'Ariadna', 'Danilo', 'Aurora',
            'Demetrio', 'Beatriz', 'Desiderio', 'Bibiana', 'Dominador', 'Blanca', 'Donato', 'Brenda',
        ];

        $lastNames = [
            'Santos', 'Reyes', 'Montoya', 'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
            'Gonzalez', 'Flores', 'Rivera', 'Cruz', 'Morales', 'Gutierrez', 'Alvarez', 'Ramirez',
            'Medina', 'Castillo', 'Ramos', 'Jimenez', 'Rojas', 'Ortiz', 'Suarez', 'Navarro',
            'Vargas', 'Campos', 'Solis', 'Vega', 'Romero', 'Aguilar', 'Guerrero', 'Escobar',
            'Delgado', 'Cabrera', 'Contreras', 'Fuentes', 'Maldonado', 'Perez', 'Acosta', 'Ibarra',
            'Dominguez', 'Sandoval', 'Figueroa', 'Mejia', 'Carrillo', 'Salazar', 'Colon', 'Corpuz',
            'Mercado', 'Robles', 'Pacheco', 'Espinoza', 'Salas', 'Cano', 'Moreno', 'Aguilera',
            'Cordero', 'Salcedo', 'Velasquez', 'Coronado', 'Cordova', 'Soriano', 'Dela Cruz',
            'Bautista', 'Aquino', 'Villanueva', 'Pascual', 'Mendoza', 'Ocampo', 'Bernardo', 'Tolentino',
            'Concepcion', 'Delos Reyes', 'Magno', 'Dizon', 'Santiago', 'Andres', 'Abad', 'Alvarado',
        ];

        $genderIdentities = [
            'female', 'male', 'transgender', 'trans_woman', 'trans_man', 'non_binary',
            'genderqueer', 'gender_fluid', 'agender', 'bigender', 'two_spirit',
            'intersex', 'pangender', 'prefer_not',
        ];

        $pronouns = ['he_him', 'she_her', 'they_them', 'other'];

        $customPronouns = [
            've/vem', 'ze/zir', 'xe/xem', 'sie/hir', 'per/pers', 'hu/hum',
            'thon/thon', 'ey/em', 'e/em', 'ne/nem', 'ou/ir', 'ta/ta',
            'tey/tem', 'ay/em', 'ne/nir', 'see/ser', 've/vis',
        ];

        $sexes    = ['male', 'female', 'other'];
        $isActive = [true, false];

        // ── Build date ranges for ALL 12 months of the current year ──
        // Using round-robin assignment guarantees every month gets patients.
        // 500 clients / 12 months = ~41 per month (months 1–8 get 42, months 9–12 get 41)
        $currentYear = (int) date('Y'); // e.g. 2026

        $monthRanges = [];
        for ($m = 1; $m <= 12; $m++) {
            $lastDay = (int) date('t', mktime(0, 0, 0, $m, 1, $currentYear));
            $monthRanges[$m] = [
                'start' => sprintf('%04d-%02d-01 00:00:00', $currentYear, $m),
                'end'   => sprintf('%04d-%02d-%02d 23:59:59', $currentYear, $m, $lastDay),
            ];
        }

        // Generate 500 random clients
        for ($i = 1; $i <= 200; $i++) {
            $firstName      = $faker->randomElement($firstNames);
            $lastName       = $faker->randomElement($lastNames);
            $middleInitial  = $faker->randomLetter();
            $genderIdentity = $faker->randomElement($genderIdentities);
            $pronoun        = $faker->randomElement($pronouns);
            $customPronoun  = $pronoun === 'other' ? $faker->randomElement($customPronouns) : null;
            $sex            = $faker->randomElement($sexes);

            // Philippine mobile number
            $contactNo = '09'
                . sprintf('%02d', $faker->numberBetween(10, 99))
                . sprintf('%06d', $faker->numberBetween(100000, 999999));

            // Unique email
            $emailBase = strtolower(
                str_replace([' ', "'", '.'], '.', "{$firstName}.{$lastName}")
            ) . $i;
            $email = "{$emailBase}@clearmind.com";

            // DOB — aged 18 to 65
            $dob = $faker->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d');

            // ── Round-robin month assignment ──
            // i=1 → Jan, i=2 → Feb, ..., i=12 → Dec, i=13 → Jan, etc.
            $month     = (($i - 1) % 12) + 1;
            $range     = $monthRanges[$month];
            $createdAt = $faker->dateTimeBetween($range['start'], $range['end']);

            // Use manual save so we can set created_at freely
            $user = User::where('email', $email)->first();
            if (!$user) {
                $user = new User();
            }

            $user->fill([
                'firstName'        => $firstName,
                'lastName'         => $lastName,
                'middleInitial'    => $middleInitial,
                'dob'              => $dob,
                'sex'              => $sex,
                'genderIdentity'   => $genderIdentity,
                'preferredPronoun' => $pronoun,
                'customPronoun'    => $customPronoun,
                'contactNo'        => $contactNo,
                'address'          => $faker->address(),
                'email'            => $email,
                'password'         => Hash::make('client123'),
                'role'             => User::ROLE_CLIENT,
                'is_active'        => $faker->randomElement($isActive),
            ]);

            // Disable Eloquent auto-timestamps so we control created_at
            $user->timestamps = false;
            $user->created_at = $createdAt;
            $user->updated_at = $createdAt;
            $user->save();

            if ($i % 50 === 0) {
                $this->command->info("Created {$i} clients...");
            }
        }

        // ── Summary ──
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════');
        $this->command->info('✅ Seeding Complete!');
        $this->command->info('═══════════════════════════════════════');
        $this->command->info('📊 Database Statistics:');
        $this->command->info('   • Admin Accounts:  1');
        $this->command->info('   • Doctor Accounts: 3');
        $this->command->info('   • Client Accounts: 500');
        $this->command->info('   • Total Users:     504');
        $this->command->info('');
        $this->command->info('🔑 Test Credentials:');
        $this->command->info('   Admin:    admin@clearmind.com  / admin123');
        $this->command->info('   Doctor 1: doctor@clearmind.com / doctor123');
        $this->command->info('   Doctor 2: doctor2@clearmind.com / doctor123');
        $this->command->info('   Doctor 3: doctor3@clearmind.com / doctor123');
        $this->command->info('   Clients:  [name]@clearmind.com / client123');
        $this->command->info('');
        $this->command->info('📈 Monthly Distribution (~41-42 per month):');
        $this->command->info('   Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec ✅');
        $this->command->info('');
        $this->command->info('💡 Run: php artisan migrate:fresh --seed');
        $this->command->info('═══════════════════════════════════════');
    }

//   public function run(): void
// {
//     // Admin
//     User::updateOrCreate(
//         ['email' => 'admin@clearmind.com'],
//         [
//             'firstName' => 'System',
//             'lastName'  => 'Admin',
//             'middleInitial' => 'A',
//             'dob'       => '1990-01-01',
//             'sex'       => 'male',
//             'genderIdentity' => 'male',
//             'preferredPronoun' => 'he_him',
//             'contactNo' => '09000000001',
//             'password'  => Hash::make('admin123'),
//             'role'      => User::ROLE_ADMIN,
//             'is_active' => true,
//         ]
//     );

//     // ONE Doctor
//     User::updateOrCreate(
//         ['email' => 'doctor@clearmind.com'],
//         [
//             'firstName' => 'Maria',
//             'lastName'  => 'Santos',
//             'middleInitial' => 'L',
//             'dob'       => '1985-06-15',
//             'sex'       => 'female',
//             'genderIdentity' => 'female',
//             'preferredPronoun' => 'she_her',
//             'contactNo' => '09123456789',
//             'password'  => Hash::make('doctor123'),
//             'role'      => User::ROLE_DOCTOR,
//             'is_active' => true,
//         ]
//     );

//     // ONE Client
//     User::updateOrCreate(
//         ['email' => 'client@clearmind.com'],
//         [
//             'firstName' => 'Juan',
//             'lastName'  => 'Dela Cruz',
//             'middleInitial' => 'M',
//             'dob'       => '2000-05-20',
//             'sex'       => 'male',
//             'genderIdentity' => 'male',
//             'preferredPronoun' => 'he_him',
//             'contactNo' => '09987654321',
//             'password'  => Hash::make('client123'),
//             'role'      => User::ROLE_CLIENT,
//             'is_active' => true,
//         ]
//     );
// }
}