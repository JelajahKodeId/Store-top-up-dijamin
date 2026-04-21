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
        Schema::create('member_tiers', function (Blueprint $table) {
            // Kita gunakan string (slug) sebagai primary key agar tidak perlu migrasi data lama
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('level')->default(0)->comment('0 = Standard, dst');
            $table->decimal('price', 15, 2)->nullable()->comment('Null jika tidak bisa dibeli (misal Standard)');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert initial data from old Enum to ensure foreign keys do not fail
        DB::table('member_tiers')->insert([
            ['id' => 'standard', 'name' => 'Member', 'level' => 0, 'price' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'reseller', 'name' => 'Reseller', 'level' => 1, 'price' => 500000.00, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'vip', 'name' => 'VIP', 'level' => 2, 'price' => 1000000.00, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
        
        // Buat relasi di tabel user dan member_tier_upgrades
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('member_tier')->references('id')->on('member_tiers')->onUpdate('cascade')->onDelete('restrict');
        });
        
        Schema::table('member_tier_upgrades', function (Blueprint $table) {
            $table->foreign('target_tier')->references('id')->on('member_tiers')->onUpdate('cascade')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_tiers');
    }
};
