<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * WhatsAppService — kirim notifikasi WA via Fonnte API.
 *
 * Konfigurasi di .env:
 *   FONNTE_TOKEN    = token API dari fonnte.com
 *   WA_ADMIN_NUMBER = nomor admin (format: 628xxx)
 *
 * Jika FONNTE_TOKEN kosong, pesan hanya dicatat ke log (graceful degradation).
 */
class WhatsAppService
{
    protected ?string $token;
    protected ?string $adminNumber;

    public function __construct()
    {
        $this->token       = config('services.fonnte.token') ?: null;
        $this->adminNumber = config('services.fonnte.admin_number') ?: null;
    }

    /**
     * Notifikasi order baru (status UNPAID) → kirim ke customer + admin.
     */
    public function sendOrderCreated(Order $order): void
    {
        $order->loadMissing(['items', 'fieldValues.field']);

        $productName  = $order->items->first()?->product_name  ?? '-';
        $durationName = $order->items->first()?->duration_name ?? '-';
        $totalPrice   = 'Rp ' . number_format((float) $order->total_price, 0, ',', '.');
        $discount     = (float) ($order->discount_amount ?? 0);

        $fieldsText = '';
        foreach ($order->fieldValues as $fv) {
            $label      = $fv->field?->label ?? $fv->field?->name ?? 'Field';
            $fieldsText .= "\n  {$label}: {$fv->value}";
        }

        $paymentLine = $order->payment_url
            ? "\n\n🔗 *Link Pembayaran:*\n{$order->payment_url}"
            : '';

        $discountLine = $discount > 0
            ? "\n💸 Diskon: -Rp " . number_format($discount, 0, ',', '.')
            : '';

        $message  = "🛒 *KONFIRMASI PESANAN*\n";
        $message .= "━━━━━━━━━━━━━━━━━\n";
        $message .= "📋 Invoice: *{$order->invoice_code}*\n";
        $message .= "🎮 Produk: {$productName}\n";
        $message .= "⏱ Paket: {$durationName}\n";
        $message .= "💰 Harga: {$totalPrice}{$discountLine}\n";
        $message .= "📱 WhatsApp: {$order->whatsapp_number}\n";
        $message .= "💳 Metode: {$order->payment_method}";

        if ($fieldsText) {
            $message .= "\n\n📝 *Data Produk:*{$fieldsText}";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━";
        $message .= $paymentLine;
        $message .= "\n\n_Segera selesaikan pembayaran sebelum waktu habis._";

        // Kirim ke customer
        if ($order->whatsapp_number) {
            $this->send($order->whatsapp_number, $message);
        }

        // Kirim ringkasan ke admin
        if ($this->adminNumber) {
            $adminMsg  = "🔔 *ORDER BARU MASUK*\n";
            $adminMsg .= "📋 {$order->invoice_code} | {$productName} | {$totalPrice}\n";
            $adminMsg .= "📱 {$order->whatsapp_number} | {$order->payment_method}";
            if ($fieldsText) {
                $adminMsg .= "\n📝 Data:{$fieldsText}";
            }
            $this->send($this->adminNumber, $adminMsg);
        }
    }

    /**
     * Notifikasi key berhasil dikirim (status SUCCESS) → kirim ke customer + admin.
     */
    public function sendKeyDelivered(Order $order): void
    {
        $order->loadMissing(['items.orderKeys']);

        $productName  = $order->items->first()?->product_name  ?? '-';
        $durationName = $order->items->first()?->duration_name ?? '-';

        $keysText = '';
        foreach ($order->items as $item) {
            foreach ($item->orderKeys as $key) {
                $keysText .= "\n🔑 `{$key->key_code}`";
                if ($key->expired_at) {
                    $keysText .= "\n   ⏰ Berlaku: " . $key->expired_at->format('d M Y');
                }
            }
        }

        $message  = "✅ *PESANAN SELESAI!*\n";
        $message .= "━━━━━━━━━━━━━━━━━\n";
        $message .= "📋 Invoice: *{$order->invoice_code}*\n";
        $message .= "🎮 Produk: {$productName}\n";
        $message .= "⏱ Paket: {$durationName}\n\n";
        $message .= "*KEY / LISENSI ANDA:*{$keysText}\n\n";
        $message .= "━━━━━━━━━━━━━━━━━\n";
        $message .= "⚠️ Simpan key ini dengan aman. Jangan bagikan ke siapapun.";

        if ($order->whatsapp_number) {
            $this->send($order->whatsapp_number, $message);
        }

        if ($this->adminNumber) {
            $this->send($this->adminNumber, "✅ Key terkirim: *{$order->invoice_code}*");
        }
    }

    /**
     * Kirim WA via Fonnte API. Jika token kosong → hanya log.
     */
    protected function send(string $target, string $message): bool
    {
        $target = preg_replace('/[^0-9]/', '', $target);
        if (str_starts_with($target, '0')) {
            $target = '62' . substr($target, 1);
        }

        if (empty($this->token)) {
            Log::info("[WhatsApp LOG] → {$target}:\n" . $message);
            return false;
        }

        try {
            $response = Http::withHeaders(['Authorization' => $this->token])
                ->timeout(10)
                ->post('https://api.fonnte.com/send', [
                    'target'  => $target,
                    'message' => $message,
                    'typing'  => false,
                    'delay'   => 1,
                ]);

            $ok = $response->successful() && ($response->json('status') === true || $response->json('status') === 'true');

            if ($ok) {
                Log::info("WhatsApp: Terkirim ke {$target}.");
            } else {
                Log::warning("WhatsApp: Gagal ke {$target} — " . $response->body());
            }

            return $ok;
        } catch (\Throwable $e) {
            Log::error("WhatsApp: Exception → {$target} — {$e->getMessage()}");
            return false;
        }
    }
}
