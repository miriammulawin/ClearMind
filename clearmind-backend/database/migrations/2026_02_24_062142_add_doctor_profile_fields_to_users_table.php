<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up(): void
{
    Schema::table('users', function (Blueprint $table) {

        $table->string('profile_picture')->nullable()->after('role');
        $table->string('certificate_image')->nullable();

        $table->string('professional_title')->nullable();
        $table->text('description')->nullable();
        $table->integer('years_of_experience')->nullable();
        $table->string('license_number')->nullable();
        $table->string('practicing_since')->nullable();

        $table->json('specializations')->nullable();
        $table->json('sub_specializations')->nullable();
        $table->json('board_certificates')->nullable();
        $table->json('services')->nullable();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
