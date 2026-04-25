<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Required for unsend: body must be nullable so it can be cleared
            $table->text('body')->nullable()->change();

            // Flag set to true when a message is unsent
            $table->boolean('unsent')->default(false)->after('attachment_path');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->text('body')->nullable(false)->change();
            $table->dropColumn('unsent');
        });
    }
};