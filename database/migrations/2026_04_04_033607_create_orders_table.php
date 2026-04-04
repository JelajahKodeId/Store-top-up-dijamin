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
            // DATA CUSTOMER
            $table->string('customer_name')->nullable();
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('invoice_code')->unique();
            $table->decimal('total_price', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->string('status')->default('unpaid');
            $table->string('payment_method')->nullable();
            $table->boolean('is_sent')->default(false);
            // voucher
            $table->foreignId('voucher_id')->nullable()->constrained();
            // tracking
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
            $table->index('customer_email');
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
