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
            $table->decimal('fee_amount', 12, 2)->default(0)->after('discount_amount');
        });

        Schema::table('wallet_topups', function (Blueprint $table) {
            $table->decimal('fee_amount', 12, 2)->default(0)->after('amount');
        });

        Schema::table('member_tier_upgrades', function (Blueprint $table) {
            $table->decimal('fee_amount', 12, 2)->default(0)->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions_tables', function (Blueprint $table) {
            //
        });
    }
};
