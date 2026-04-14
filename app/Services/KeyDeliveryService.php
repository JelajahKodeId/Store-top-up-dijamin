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
        Log::debug("KeyDelivery: Memulai proses delivery untuk Order #{$order->invoice_code}", [
            'order_id' => $order->id,
            'current_status' => $order->status->value,
            'is_sent' => $order->is_sent
        ]);

        if ($order->status !== OrderStatus::PAID) {
            Log::warning("KeyDelivery: Order #{$order->invoice_code} TIDAK dalam status PAID (status saat ini: {$order->status->value}), pengiriman dibatalkan.");

            return;
        }

        if ($order->is_sent) {
            Log::info("KeyDelivery: Order #{$order->invoice_code} sudah pernah dikirim sebelumnya, dilewati (idempotency).");

            return;
        }

        // Paksa load ulang relasi untuk memastikan data terbaru dari DB
        $order->load(['items.duration', 'items.product']);
        
        Log::debug("KeyDelivery: Jumlah item dlm order #{$order->invoice_code}: " . $order->items->count());

        try {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $index => $item) {
                    Log::debug("KeyDelivery: Memproses item indices[{$index}] - Product: {$item->product_name}, Duration: {$item->duration_name}, Qty: {$item->quantity}");
                    $this->assignKeysForItem($order, $item);
                }

                $order->update([
                    'status' => OrderStatus::SUCCESS,
                    'is_sent' => true,
                ]);
                
                Log::debug("KeyDelivery: Transaksi DB berhasil — Order #{$order->invoice_code} ditandai SUCCESS.");
            });

            // Kirim email + WA dengan key setelah transaksi berhasil
            $freshOrder = $order->fresh(['items.orderKeys', 'fieldValues']);
            
            Log::debug("KeyDelivery: Mengirim notifikasi untuk Order #{$order->invoice_code}");
            $this->notificationService->sendForStatus($freshOrder);

            try {
                $this->whatsApp->sendKeyDelivered($freshOrder);
            } catch (\Throwable $e) {
                Log::error("KeyDelivery: WA notification EXCEPTION untuk #{$order->invoice_code} — {$e->getMessage()}", [
                    'trace' => $e->getTraceAsString()
                ]);
            }

            Log::info("KeyDelivery: Order #{$order->invoice_code} selesai diproses seluruhnya.");
        } catch (InsufficientKeyStockException $e) {
            $order->update([
                'status' => OrderStatus::FAILED,
                'note' => $e->getMessage(),
            ]);

            Log::error("KeyDelivery: Stok habis untuk Order #{$order->invoice_code} — {$e->getMessage()}");
        } catch (\Throwable $e) {
            Log::error("KeyDelivery: Gagal fatal proses order #{$order->invoice_code} — {$e->getMessage()}", [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
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
            Log::debug("KeyDelivery: Mencari key available untuk item_id: {$item->id}, duration_id: {$item->product_duration_id} (iterasi: " . ($i+1) . ")");
            
            $key = ProductKey::where('product_duration_id', $item->product_duration_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (! $key) {
                Log::warning("KeyDelivery: Tidak menemukan key available untuk duration_id: {$item->product_duration_id}");
                throw new InsufficientKeyStockException(
                    $item->product_name,
                    $item->duration_name
                );
            }

            Log::debug("KeyDelivery: Berhasil menemukan Key ID: {$key->id} untuk item_id: {$item->id}");

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

            // Kurangi stok: key keluar dari pool `available`.
            $key->update([
                'status' => 'sold',
                'expires_at' => $expiredAt,
            ]);
            
            Log::debug("KeyDelivery: Key ID: {$key->id} status diubah menjadi SOLD.");
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
