<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {

            // remove old single string column
            $table->dropColumn('license_number');
        });

        Schema::table('doctors', function (Blueprint $table) {

            // new JSON array column
            $table->json('license_numbers')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {

            $table->dropColumn('license_numbers');

            $table->string('license_number', 255)
                  ->nullable()
                  ->unique();
        });
    }
};