<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Personal info
            $table->string('firstName', 100);
            $table->string('lastName', 100);
            $table->string('middleInitial', 5)->nullable();
            $table->date('dob');
            
            // Sex (biological) - keep simple
            $table->enum('sex', ['male', 'female', 'other'])->nullable();
            
            // Gender Identity - comprehensive list
            $table->enum('genderIdentity', [
                'female',
                'male',
                'transgender',
                'trans_woman',
                'trans_man',
                'non_binary',
                'genderqueer',
                'gender_fluid',
                'agender',
                'bigender',
                'two_spirit',
                'intersex',
                'pangender',
                'prefer_not'
            ])->nullable();

                // Additional patient-specific info
                   $table->enum('civilStatus', [
                    'Single', 'Married', 'Widowed', 'Divorced', 'Separated'
                ])->nullable();
            $table->enum('patientType', ['existing', 'new'])->default('new');
            $table->enum('patientClassification', ['PWD', 'Senior Citizen', 'Regular'])->default('Regular');

            // Preferred Pronouns
            $table->enum('preferredPronoun', [
                'he_him',
                'she_her',
                'they_them',
                'other'
            ])->nullable();

            // For custom pronouns (when preferredPronoun = 'other')
            $table->string('customPronoun', 100)->nullable();
            
            $table->string('contactNo', 20);
            $table->string('address', 255)->nullable();

            // Auth
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verification_code')->nullable();
            $table->string('password');

            // Role
            $table->enum('role', ['Admin', 'Doctor', 'Client'])->default('Client');

            // Status
            $table->boolean('is_active')->default(true);

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
