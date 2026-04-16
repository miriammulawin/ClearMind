<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * doctor_schedules – stores ONE working-hours window per day.
     *
     * Example row:
     *   doctor_id=1, day_of_week=1 (Monday),
     *   start_time=09:00, end_time=18:00,
     *   slot_type=physical, is_active=true
     *
     * One doctor can have at most ONE row per day_of_week
     * (enforced by the unique index on doctor_id + day_of_week).
     */
    public function up(): void
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id('schedule_id');

            $table->unsignedBigInteger('doctor_id');
            $table->foreign('doctor_id')
                  ->references('doctor_id')
                  ->on('doctors')
                  ->onDelete('cascade');

            // 0=Sunday … 6=Saturday
            $table->tinyInteger('day_of_week')
                  ->unsigned()
                  ->comment('0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat');

            // Working-hours window for this day
            $table->time('start_time')->comment('e.g. 09:00');
            $table->time('end_time')->comment('e.g. 18:00');

            // Consultation type for this day
            $table->enum('slot_type', ['online', 'physical', 'both'])->default('physical');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // One schedule window per doctor per day
            $table->unique(
                ['doctor_id', 'day_of_week', 'deleted_at'],
                'unique_doctor_day'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};