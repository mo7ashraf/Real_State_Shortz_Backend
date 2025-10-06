<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('tbl_post') && !Schema::hasColumn('tbl_post', 'property_id')) {
            Schema::table('tbl_post', function (Blueprint $table) {
                $table->unsignedBigInteger('property_id')->nullable()->after('user_id')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tbl_post') && Schema::hasColumn('tbl_post', 'property_id')) {
            Schema::table('tbl_post', function (Blueprint $table) {
                $table->dropColumn('property_id');
            });
        }
    }
};
