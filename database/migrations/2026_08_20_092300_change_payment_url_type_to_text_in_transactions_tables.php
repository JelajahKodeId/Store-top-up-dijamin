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
        Schema::table('orders', function (Blueprint $table) {
            $table->text('payment_url')->nullable()->change();
        });

        Schema::table('wallet_topups', function (Blueprint $table) {
            $table->text('payment_url')->nullable()->change();
        });

        Schema::table('member_tier_upgrades', function (Blueprint $table) {
            $table->text('payment_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_url', 255)->nullable()->change();
        });

        Schema::table('wallet_topups', function (Blueprint $table) {
            $table->string('payment_url', 255)->nullable()->change();
        });

        Schema::table('member_tier_upgrades', function (Blueprint $table) {
            $table->string('payment_url', 255)->nullable()->change();
        });
    }
};
