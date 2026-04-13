<?php
// database/migrations/2024_01_01_000001_create_patients_table.php
// ⚠️  The filename date (000001) must be EARLIER than the appointments migration

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id('patient_id');

            // Link to user account (optional — null when booked by someone else)
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();

            // Basic Info
            $table->string('firstName', 100);
            $table->string('lastName', 100);
            $table->string('middleInitial', 5)->nullable();
            $table->date('dob')->nullable();

            // Sex & Gender
            $table->enum('sex', ['male', 'female', 'other'])->nullable();
            $table->enum('genderIdentity', [
                'female', 'male', 'transgender', 'trans_woman', 'trans_man',
                'non_binary', 'genderqueer', 'gender_fluid', 'agender',
                'bigender', 'two_spirit', 'intersex', 'pangender', 'prefer_not',
            ])->nullable();

            // Civil & Classification
            $table->enum('civilStatus', [
                'single', 'married', 'widowed', 'divorced', 'separated',
            ])->nullable();
            $table->enum('patientClassification', [
                'PWD', 'Senior Citizen', 'Regular',
            ])->default('Regular');

            // Contact
            $table->string('contactNo', 20)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('address', 255)->nullable();

            // Notes
            $table->text('notes')->nullable();

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};