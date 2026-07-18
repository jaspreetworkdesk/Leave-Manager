<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Remove old varchar default first
        DB::statement('ALTER TABLE leaves ALTER COLUMN total_days DROP DEFAULT');

        // Convert existing string values to decimal
        DB::statement('ALTER TABLE leaves ALTER COLUMN total_days TYPE DECIMAL(5,1) USING total_days::DECIMAL(5,1)');

        // Set new decimal default
        DB::statement("ALTER TABLE leaves ALTER COLUMN total_days SET DEFAULT 1.0");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE leaves ALTER COLUMN total_days DROP DEFAULT');

        DB::statement('ALTER TABLE leaves ALTER COLUMN total_days TYPE VARCHAR(255) USING total_days::VARCHAR');

        DB::statement("ALTER TABLE leaves ALTER COLUMN total_days SET DEFAULT '1'");
    }
};