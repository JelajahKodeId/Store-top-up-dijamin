<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Notifikasi WhatsApp lewat gateway Node (folder wa-server), scan QR di panel admin.
 *
 * Nomor admin (ringkasan order): prioritas `settings.whatsapp_number`, lalu WA_ADMIN_NUMBER (.env).
 */
class WhatsAppService
{
    protected ?string $waServerUrl;

    protected ?string $waServerSecret;

    public function __construct()
    {
        $this->waServerUrl = $this->normalizeUrl(config('services.whatsapp.server_url'));
        $this->waServerSecret = config('services.whatsapp.server_secret') ?: null;
    }

    protected function normalizeUrl(?string $url): ?string
    {
        if (! is_string($url) || trim($url) === '') {
            return null;
        }

        return rtrim($url, '/');
    }

    protected function resolveAdminNumber(): ?string
    {
        $fromDb = Setting::where('key', 'whatsapp_number')->value('value');
        if (is_string($fromDb) && trim($fromDb) !== '') {
            return trim($fromDb);
        }

        $env = config('services.whatsapp.admin_number');

        return is_string($env) && trim($env) !== '' ? trim($env) : null;
    }

    public function sendOrderCreated(Order $order): void
    {
        $order->loadMissing(['items', 'fieldValues.field']);

        $productName = $order->items->first()?->product_name ?? '-';
        $durationName = $order->items->first()?->duration_name ?? '-';
        $totalPrice = 'Rp '.number_format((float) $order->total_price, 0, ',', '.');
        $discount = (float) ($order->discount_amount ?? 0);

        $fieldsText = '';
        foreach ($order->fieldValues as $fv) {
            $label = $fv->field?->label ?? $fv->field?->name ?? 'Field';
            $fieldsText .= "\n  {$label}: {$fv->value}";
        }

        $paymentLine = $order->payment_url
            ? "\n\n🔗 *Link Pembayaran:*\n{$order->payment_url}"
            : '';

        $discountLine = $discount > 0
            ? "\n💸 Diskon: -Rp ".number_format($discount, 0, ',', '.')
            : '';

        $message = "🛒 *KONFIRMASI PESANAN*\n";
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

        if ($order->whatsapp_number) {
            $this->send($order->whatsapp_number, $message);
        }

        $admin = $this->resolveAdminNumber();
        if ($admin) {
            $adminMsg = "🔔 *ORDER BARU MASUK*\n";
            $adminMsg .= "📋 {$order->invoice_code} | {$productName} | {$totalPrice}\n";
            $adminMsg .= "📱 {$order->whatsapp_number} | {$order->payment_method}";
            if ($fieldsText) {
                $adminMsg .= "\n📝 Data:{$fieldsText}";
            }
            $this->send($admin, $adminMsg);
        }
    }

    public function sendKeyDelivered(Order $order): void
    {
        $order->loadMissing(['items.orderKeys']);

        $productName = $order->items->first()?->product_name ?? '-';
        $durationName = $order->items->first()?->duration_name ?? '-';

        $keysText = '';
        foreach ($order->items as $item) {
            foreach ($item->orderKeys as $key) {
                $keysText .= "\n🔑 `{$key->key_code}`";
                if ($key->expired_at) {
                    $keysText .= "\n   ⏰ Berlaku: ".$key->expired_at->format('d M Y');
                }
            }
        }

        $message = "✅ *PESANAN SELESAI!*\n";
        $message .= "━━━━━━━━━━━━━━━━━\n";
        $message .= "📋 Invoice: *{$order->invoice_code}*\n";
        $message .= "🎮 Produk: {$productName}\n";
        $message .= "⏱ Paket: {$durationName}\n\n";
        $message .= "*KEY / LISENSI ANDA:*{$keysText}\n\n";
        $message .= "━━━━━━━━━━━━━━━━━\n";
        $message .= '⚠️ Simpan key ini dengan aman. Jangan bagikan ke siapapun.';

        if ($order->whatsapp_number) {
            $this->send($order->whatsapp_number, $message);
        }

        $admin = $this->resolveAdminNumber();
        if ($admin) {
            $this->send($admin, "✅ Key terkirim: *{$order->invoice_code}*");
        }
    }

    protected function send(string $target, string $message): bool
    {
        $target = preg_replace('/[^0-9]/', '', $target);
        if (str_starts_with($target, '0')) {
            $target = '62'.substr($target, 1);
        }

        if ($this->waServerUrl === null) {
            Log::warning('[WhatsApp] WA_SERVER_URL kosong — pesan tidak dikirim ke '.$target);

            return false;
        }

        try {
            $req = Http::timeout(25)->acceptJson()->asJson();
            if ($this->waServerSecret) {
                $req = $req->withToken($this->waServerSecret);
            }

            $response = $req->post("{$this->waServerUrl}/send", [
                'number' => $target,
                'message' => $message,
            ]);

            $ok = $response->successful() && ($response->json('success') === true);

            if ($ok) {
                Log::info("WhatsApp: Terkirim ke {$target}.");
            } else {
                Log::warning('WhatsApp: Gagal ke '.$target.' — '.$response->body());
            }

            return $ok;
        } catch (\Throwable $e) {
            Log::error("WhatsApp: Exception → {$target} — {$e->getMessage()}");

            return false;
        }
    }
}
