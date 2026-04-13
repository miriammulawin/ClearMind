<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id('doctor_id');

            // ── Linked user account ──────────────────────────────────
            $table->unsignedBigInteger('user_id')->unique();
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // ── Basic credentials ────────────────────────────────────
            $table->string('prc_number', 255)->nullable()->unique();
            $table->string('license_number', 255)->nullable()->unique();
            $table->string('professional_title', 255)->nullable();
            $table->text('description')->nullable();

            // ── Experience ───────────────────────────────────────────
            $table->integer('years_of_experience')->nullable();
            $table->string('practicing_since', 10)->nullable();  // e.g. "2005"

            // ── Specialty ────────────────────────────────────────────
            $table->string('main_specialty', 255)->nullable();

            // ── JSON arrays ──────────────────────────────────────────
            // List of specialization strings  e.g. ["Psychiatry","Neurology"]
            $table->json('specializations')->nullable();

            // List of sub-specialization strings
            $table->json('sub_specializations')->nullable();

            // Board certificate names  e.g. ["ABPN","ABIM"]
            $table->json('board_cert_names')->nullable();

            // Storage paths for uploaded board certificate images
            $table->json('board_cert_images')->nullable();

            // Storage paths for uploaded government / professional ID pictures
            $table->json('id_pictures')->nullable();

            // List of services the doctor offers
            $table->json('services')->nullable();

            // ── Profile picture ──────────────────────────────────────
            $table->string('profile_picture', 255)->nullable();

            // ── Profile completion flags ─────────────────────────────
            $table->boolean('profile_completed')->default(false);
            $table->timestamp('profile_completed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};