<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('author_name', 120);
            $table->unsignedTinyInteger('rating');
            $table->text('body');
            $table->string('invoice_code', 100)->nullable();
            $table->boolean('verified_purchase')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->index(['product_id', 'is_published', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
