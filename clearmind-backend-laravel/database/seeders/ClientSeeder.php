<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 50 clients
        User::factory()->count(50)->create([
            'role' => 'Client', // ensure they are clients
        ]);
    }
}
