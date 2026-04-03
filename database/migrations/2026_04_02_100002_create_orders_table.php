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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('trx_id')->unique(); // Internal Transaction ID
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Nullable for guest
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('target_id');
            $table->string('zone_id')->nullable();
            $table->decimal('total_price', 15, 2);
            $table->enum('status', ['unpaid', 'paid', 'success', 'failed', 'canceled'])->default('unpaid');
            $table->foreignId('payment_method_id')->constrained()->onDelete('cascade');
            $table->string('reference')->nullable()->unique(); // PG Reference
            $table->text('note')->nullable();
            $table->string('customer_name')->nullable();  // Nama pelanggan (guest/member)
            $table->string('customer_email')->nullable(); // Email penerima notifikasi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
