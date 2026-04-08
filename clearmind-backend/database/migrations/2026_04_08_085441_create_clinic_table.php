<?php
// database/migrations/xxxx_create_clinics_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->id('clinic_id');
            $table->string('clinic_name', 100);
            $table->enum('clinic_type', ['Physical', 'Online']);
            $table->string('clinic_address', 255)->nullable();
            $table->string('blk', 150)->nullable();
            $table->string('barangay', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->string('clinic_image', 500)->nullable();
            $table->text('clinic_description')->nullable();
            $table->json('clinic_schedule')->nullable();
            $table->string('clinic_paymentMethod', 50)->default('Gcash');
            $table->string('clinic_fee', 100)->nullable();
            $table->string('qr_image', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};