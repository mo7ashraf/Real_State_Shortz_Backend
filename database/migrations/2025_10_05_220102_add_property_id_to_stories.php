<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('stories') && !Schema::hasColumn('stories', 'property_id')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->unsignedBigInteger('property_id')->nullable()->after('user_id')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('stories') && Schema::hasColumn('stories', 'property_id')) {
            Schema::table('stories', function (Blueprint $table) {
                $table->dropColumn('property_id');
            });
        }
    }
};
