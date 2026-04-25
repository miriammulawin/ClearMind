<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_requirements', function (Blueprint $table) {
            $table->id('requirement_id');

            $table->unsignedBigInteger('appointment_id')->unique();
            $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->cascadeOnDelete();

            $table->unsignedBigInteger('patient_id');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->cascadeOnDelete();

            $table->unsignedBigInteger('doctor_user_id')->nullable();
            $table->foreign('doctor_user_id')->references('id')->on('users')->nullOnDelete();

            $table->unsignedBigInteger('purpose_id')->nullable();
            $table->foreign('purpose_id')->references('purpose_id')->on('assessment_purposes')->nullOnDelete();

            // ── VAWC / Legal docs ─────────────────────────────────────
            // mandatoryDocs: Blotter Report, Police Report, RACO or CSWD Endorsement
            $table->string('blotter_report_path', 500)->nullable();
            $table->string('police_report_path', 500)->nullable();
            $table->string('cswd_endorsement_path', 500)->nullable();

            // ── Adoption or Other Legal Purposes ─────────────────────
            // extraField: legalType
            $table->string('legal_type', 100)->nullable(); // Adoption, Custody, Annulment, Other Legal Purpose

            // ── School / Academic Support ─────────────────────────────
            // extraField: school
            $table->string('school_institution', 200)->nullable();
            $table->string('incident_report_path', 500)->nullable(); // optionalDoc

            // ── Work-related Purpose ──────────────────────────────────
            // extraField: company
            $table->string('company_employer', 200)->nullable();

            // ── Pre-Employment Purpose ────────────────────────────────
            // extraField: preEmployment
            $table->string('employer_name', 200)->nullable();
            $table->boolean('wants_printed_report')->nullable();

            // ── ESA Certification ─────────────────────────────────────
            // extraField: esa
            $table->enum('travel_type', ['Local', 'International'])->nullable();
            $table->boolean('has_diagnosis')->nullable();
            $table->string('diagnosis_file_path', 500)->nullable();

            // ── Mental Health Certification for Internship ────────────
            // extraField: internship
            $table->string('school_name', 200)->nullable();
            $table->string('program', 200)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_requirements');
    }
};