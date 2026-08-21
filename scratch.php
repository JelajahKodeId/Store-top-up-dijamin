<?php
use Illuminate\Support\Facades\Schema;

echo "orders.payment_url: " . Schema::getColumnType('orders', 'payment_url') . "\n";
echo "wallet_topups.payment_url: " . Schema::getColumnType('wallet_topups', 'payment_url') . "\n";
echo "member_tier_upgrades.payment_url: " . Schema::getColumnType('member_tier_upgrades', 'payment_url') . "\n";
