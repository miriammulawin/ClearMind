<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_purposes', function (Blueprint $table) {
            $table->id('purpose_id');
            $table->foreignId('service_id')->constrained('services', 'service_id')->cascadeOnDelete();
            $table->string('purpose_name');
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_purposes');
    }
};
