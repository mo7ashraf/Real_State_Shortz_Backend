<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->nullable()->index(); // references tbl_users.id
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('property_type', ['apartment','villa','land','shop','office','other'])->index();
            $table->enum('listing_type', ['sale','rent'])->index();
            $table->decimal('price_sar', 12, 2)->nullable();
            $table->decimal('area_sqm', 10, 2)->nullable();
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->string('city', 120)->nullable()->index();
            $table->string('district', 120)->nullable()->index();
            $table->string('address', 255)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->unsignedInteger('published_post_id')->nullable()->index(); // tbl_post.id created when you publish
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
