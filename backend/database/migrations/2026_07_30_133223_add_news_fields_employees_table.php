<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('alternate_phone')
                ->nullable()
                ->after('phone');

            $table->date('date_of_birth')
                ->nullable();

            $table->text('alternate_address')
                ->nullable()
                ->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'alternate_phone',
                'date_of_birth',
                'alternate_address',
            ]);
        });
    }
};