<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // payments.reference_id harus unik — cegah duplikat callback dari gateway
        Schema::table('payments', function (Blueprint $table) {
            $table->unique('reference_id', 'payments_reference_id_unique');
        });

        // Indeks komposit untuk query voucher aktif yang sering dipakai saat checkout
        Schema::table('vouchers', function (Blueprint $table) {
            $table->index(['is_active', 'expired_at'], 'vouchers_active_expired_index');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_reference_id_unique');
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropIndex('vouchers_active_expired_index');
        });
    }
};
