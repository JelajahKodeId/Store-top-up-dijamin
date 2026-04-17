<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_tier_upgrades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('target_tier', 20);
            $table->string('invoice_code', 40)->unique();
            $table->decimal('amount', 12, 2);
            $table->string('status', 20)->default('pending');
            $table->string('gateway')->nullable();
            $table->string('gateway_payment_reference')->nullable()->index();
            $table->string('payment_method')->nullable();
            $table->string('payment_url')->nullable();
            $table->timestamp('payment_expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_tier_upgrades');
    }
};
