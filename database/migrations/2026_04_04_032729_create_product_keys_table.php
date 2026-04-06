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
        Schema::create('product_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_duration_id')->constrained()->cascadeOnDelete();
            $table->string('key_code')->unique();
            $table->enum('status', ['available', 'sold', 'expired'])->default('available');
            $table->timestamp('expires_at')->nullable(); // tanggal key kadaluarsa setelah dialokasikan
            $table->timestamps();
            $table->index(['product_id', 'status']);
            $table->index(['product_duration_id', 'status']); // index untuk query ambil key available per durasi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_keys');
    }
};
