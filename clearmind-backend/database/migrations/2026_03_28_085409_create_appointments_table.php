<?php
// database/migrations/2024_01_01_000002_create_appointments_table.php
// ⚠️  The filename date (000002) must be LATER than the patients migration

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointment_id');

            // Who booked (logged-in Client or Admin) — links to users.id
            $table->unsignedBigInteger('booked_by_user_id')->nullable();
            $table->foreign('booked_by_user_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();

            // The actual patient — links to patients.patient_id
            $table->unsignedBigInteger('patient_id');
            $table->foreign('patient_id')
                  ->references('patient_id')
                  ->on('patients')
                  ->cascadeOnDelete();

            // Informant (when booker != patient)
            $table->string('informant_name', 200)->nullable();
            $table->string('informant_relation', 100)->nullable();

            // Assigned doctor — links to users.id (role = Doctor)
            $table->unsignedBigInteger('doctor_user_id')->nullable();
            $table->foreign('doctor_user_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();

            // Schedule
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');

            // Visit type
            $table->enum('visit_type', ['onsite', 'virtual'])->default('onsite');

            // Reason / chief complaint
            $table->string('reason_for_consultation', 500)->nullable();

            // ✅ FIXED: was enum with only 2 hardcoded values — broke whenever
            //    a service name from the API didn't exactly match.
            //    Now a plain string so any service name is accepted.
            $table->string('service_type', 100)->nullable();

            // PAE sub-purpose (only when service_type = PAE)
            $table->string('pae_purpose', 200)->nullable();

            // Payment
            $table->enum('payment_status', ['paid', 'not_paid', 'probono'])->default('not_paid');
            $table->json('receipt_paths')->nullable();

            // Status
            $table->enum('status', [
                'pending', 'confirmed', 'completed', 'cancelled', 'no_show',
            ])->default('pending');

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};