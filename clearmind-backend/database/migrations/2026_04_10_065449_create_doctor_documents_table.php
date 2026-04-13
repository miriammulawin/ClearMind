<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_documents', function (Blueprint $table) {
            $table->id();

            // 🔗 Link to doctor
            $table->unsignedBigInteger('doctor_id');
            $table->index('doctor_id');

            // 📂 Type (certificate or id)
            $table->enum('type', ['board_certificate', 'id_card']);

            // 🏷 Certificate name (optional for IDs)
            $table->string('document_name')->nullable();

            // 📁 File path
            $table->string('file_path');

            $table->timestamps();
 $table->foreign('doctor_id')
                  ->references('doctor_id')
                  ->on('doctors')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_documents');
    }
};