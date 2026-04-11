<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientKeyStockException;
use App\Models\Order;
use App\Models\OrderKey;
use App\Models\ProductKey;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KeyDeliveryService
{
    public function __construct(
        protected OrderNotificationService $notificationService,
        protected WhatsAppService $whatsApp,
    ) {}

    /**
     * Kirim key ke customer setelah pembayaran dikonfirmasi.
     * Menggunakan DB transaction + SELECT FOR UPDATE untuk mencegah race condition.
     */
    public function deliver(Order $order): void
    {
        if ($order->status !== OrderStatus::PAID) {
            Log::warning("KeyDelivery: Order #{$order->invoice_code} tidak dalam status PAID, dilewati.");

            return;
        }

        if ($order->is_sent) {
            Log::info("KeyDelivery: Order #{$order->invoice_code} sudah pernah dikirim, dilewati (idempotency guard).");

            return;
        }

        // Selalu load ulang relasi (bukan loadMissing) untuk hindari stale cache dari observer/mail
        $order->load(['items.duration', 'items.product']);

        try {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    $this->assignKeysForItem($order, $item);
                }

                $order->update([
                    'status' => OrderStatus::SUCCESS,
                    'is_sent' => true,
                ]);
            });

            // Kirim email + WA dengan key setelah transaksi berhasil
            $freshOrder = $order->fresh(['items.orderKeys', 'fieldValues']);
            $this->notificationService->sendForStatus($freshOrder);

            try {
                $this->whatsApp->sendKeyDelivered($freshOrder);
            } catch (\Throwable $e) {
                Log::warning("KeyDelivery: WA notification gagal — {$e->getMessage()}");
            }

            Log::info("KeyDelivery: Order #{$order->invoice_code} berhasil dikirim.");
        } catch (InsufficientKeyStockException $e) {
            // Tandai order sebagai failed dan notify admin
            $order->update([
                'status' => OrderStatus::FAILED,
                'note' => $e->getMessage(),
            ]);

            Log::error("KeyDelivery: Stok habis — {$e->getMessage()}");

            // TODO: Kirim notifikasi ke admin (dapat ditambahkan nanti)
        } catch (\Throwable $e) {
            Log::error("KeyDelivery: Gagal proses order #{$order->invoice_code} — {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Assign satu key per item, dengan lock untuk cegah race condition.
     */
    protected function assignKeysForItem(Order $order, $item): void
    {
        $quantity = max(1, (int) $item->quantity);

        for ($i = 0; $i < $quantity; $i++) {
            $key = ProductKey::where('product_duration_id', $item->product_duration_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (! $key) {
                throw new InsufficientKeyStockException(
                    $item->product_name,
                    $item->duration_name
                );
            }

            // Tentukan expired_at dari durasi produk (dalam hari)
            $expiredAt = null;
            if ($item->duration && $item->duration->duration_days > 0) {
                $expiredAt = now()->addDays($item->duration->duration_days);
            }

            OrderKey::create([
                'order_item_id' => $item->id,
                'product_key_id' => $key->id,
                'key_code' => $key->key_code,
                'expired_at' => $expiredAt,
                'delivered_at' => now(),
            ]);

            // Kurangi stok: key keluar dari pool `available` (tampil sebagai stok di katalog).
            $key->update([
                'status' => 'sold',
                'expires_at' => $expiredAt,
            ]);
        }
    }

    /**
     * Cek apakah stok cukup untuk semua item dalam order (tanpa assign).
     */
    public function hasEnoughStock(Order $order): bool
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $available = ProductKey::where('product_duration_id', $item->product_duration_id)
                ->where('status', 'available')
                ->count();

            if ($available < $item->quantity) {
                return false;
            }
        }

        return true;
    }
}
