<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use App\Support\PaymentLabels;
use App\Support\WhatsAppGateway;
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
        $this->waServerUrl = WhatsAppGateway::normalizeServerUrl(
            config('services.whatsapp.server_url'),
            app()->isProduction()
        );
        $this->waServerSecret = config('services.whatsapp.server_secret') ?: null;
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

    protected function formatIdr(float|int|string|null $amount): string
    {
        return 'Rp '.number_format((float) $amount, 0, ',', '.');
    }

    public function sendOrderCreated(Order $order): void
    {
        $order->loadMissing(['items', 'fieldValues.field', 'payment']);

        $discount = (float) ($order->discount_amount ?? 0);
        $methodLabel = PaymentLabels::methodLabel($order->payment_method, $order->payment?->gateway);
        $methodLine = $methodLabel !== '' ? $methodLabel : ($order->payment_method ?? '-');

        $itemsText = '';
        foreach ($order->items as $item) {
            $qty = max(1, (int) $item->quantity);
            $lineTotal = (float) $item->price * $qty;
            $itemsText .= "\n  • {$item->product_name}\n";
            $itemsText .= "    Paket: {$item->duration_name} × {$qty}\n";
            $itemsText .= '    Subtotal: '.$this->formatIdr($lineTotal);
        }

        $fieldsText = '';
        foreach ($order->fieldValues as $fv) {
            $label = $fv->field?->label ?? $fv->field?->name ?? 'Field';
            $fieldsText .= "\n  • {$label}: {$fv->value}";
        }

        $paymentLine = $order->payment_url
            ? "\n\n🔗 *Link pembayaran:*\n{$order->payment_url}"
            : "\n\n_Tunggu instruksi pembayaran di halaman status pesanan jika link belum tersedia._";

        $discountLine = $discount > 0
            ? "\n💸 Diskon: -".$this->formatIdr($discount)
            : '';

        $expiryLine = '';
        if ($order->payment_expired_at) {
            $expiryLine = "\n⏰ *Batas bayar:* ".$order->payment_expired_at->timezone(config('app.timezone'))->format('d M Y, H:i').' WIB';
        }

        $customerLine = '';
        if ($order->customer_name) {
            $customerLine = "\n👤 Nama: {$order->customer_name}";
        }

        $message = "🛒 *KONFIRMASI PESANAN*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📋 *Invoice:* {$order->invoice_code}\n";
        $message .= '📅 Dibuat: '.$order->created_at->timezone(config('app.timezone'))->format('d M Y, H:i')." WIB\n";
        $message .= "📱 WhatsApp: {$order->whatsapp_number}";
        $message .= $customerLine;
        $message .= "\n💳 *Metode bayar:* {$methodLine}";
        $message .= "\n\n🛍️ *Rincian item:*{$itemsText}";
        $message .= "\n\n💰 *Total dibayar:* ".$this->formatIdr($order->total_price).$discountLine;
        $message .= $expiryLine;

        if ($fieldsText !== '') {
            $message .= "\n\n📝 *Data tambahan:*{$fieldsText}";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━";
        $message .= $paymentLine;
        $message .= "\n\n_Segera selesaikan pembayaran. Setelah lunas, key akan dikirim ke nomor WhatsApp ini._";

        if ($order->whatsapp_number) {
            $this->send($order->whatsapp_number, $message);
        }

        $admin = $this->resolveAdminNumber();
        if ($admin) {
            $adminMsg = "🔔 *ORDER BARU*\n";
            $adminMsg .= "📋 {$order->invoice_code} — ".$this->formatIdr($order->total_price)."\n";
            $adminMsg .= "📱 {$order->whatsapp_number} | {$methodLine}";
            if ($fieldsText !== '') {
                $adminMsg .= "\n📝 Data:{$fieldsText}";
            }
            $this->send($admin, $adminMsg);
        }
    }

    public function sendKeyDelivered(Order $order): void
    {
        $order->loadMissing(['items.orderKeys', 'payment']);

        $methodLabel = PaymentLabels::methodLabel($order->payment_method, $order->payment?->gateway);
        $methodLine = $methodLabel !== '' ? $methodLabel : ($order->payment_method ?? '-');

        $blocks = '';
        foreach ($order->items as $item) {
            $qty = max(1, (int) $item->quantity);
            $blocks .= "\n\n📦 *{$item->product_name}*\n";
            $blocks .= "   Paket: {$item->duration_name} × {$qty}\n";
            $blocks .= '   Subtotal: '.$this->formatIdr((float) $item->price * $qty)."\n";

            if ($item->orderKeys->isEmpty()) {
                $blocks .= "   _(Key tidak terlampir — hubungi CS.)_\n";

                continue;
            }

            foreach ($item->orderKeys as $idx => $key) {
                $n = $idx + 1;
                $blocks .= "   🔑 Key {$n}: `{$key->key_code}`";
                $blocks .= "\n";
            }
        }

        $message = "✅ *PEMBAYARAN BERHASIL — KEY SIAP*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📋 *Invoice:* {$order->invoice_code}\n";
        $message .= '📅 Selesai: '.now()->timezone(config('app.timezone'))->format('d M Y, H:i')." WIB\n";
        $message .= "💳 Metode: {$methodLine}\n";
        $message .= '💰 *Total:* '.$this->formatIdr($order->total_price);
        $message .= "\n📱 Pembeli: {$order->whatsapp_number}";
        $message .= "\n\n*KEY / LISENSI ANDA:*{$blocks}\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "ℹ️ Stok key untuk pesanan ini sudah dialokasikan dari inventori kami.\n";
        $message .= "⚠️ *Simpan rahasia.* Jangan bagikan key ke orang lain. Simpan bukti di galeri Anda jika perlu.\n";
        $message .= "\n_Terima kasih berbelanja di Mall Store._";

        if ($order->whatsapp_number) {
            $this->send($order->whatsapp_number, $message);
        }

        $admin = $this->resolveAdminNumber();
        if ($admin) {
            $keyCount = $order->items->sum(fn ($i) => $i->orderKeys->count());
            $adminMsg = "✅ *Key terkirim ke pelanggan*\n";
            $adminMsg .= "📋 {$order->invoice_code} | {$keyCount} key | ".$this->formatIdr($order->total_price)."\n";
            $adminMsg .= "📱 {$order->whatsapp_number}";
            $this->send($admin, $adminMsg);
        }
    }

    protected function send(string $target, string $message): bool
    {
        $normalized = WhatsAppGateway::normalizeRecipientNumber($target);
        if ($normalized === null) {
            Log::warning('[WhatsApp] Nomor penerima tidak valid — pengiriman dibatalkan.');

            return false;
        }

        $target = $normalized;

        if ($this->waServerUrl === null) {
            Log::warning('[WhatsApp] WA_SERVER_URL tidak valid atau kosong — pesan tidak dikirim.');

            return false;
        }

        if (app()->isProduction() && empty($this->waServerSecret)) {
            Log::error('[WhatsApp] WHATSAPP_SERVER_SECRET wajib di production — pesan tidak dikirim.');

            return false;
        }

        try {
            // Health check singkat ke /status untuk memastikan server siap
            $healthReq = Http::timeout(5)->acceptJson();
            if ($this->waServerSecret) {
                $healthReq = $healthReq->withToken($this->waServerSecret);
            }
            $healthResponse = $healthReq->get("{$this->waServerUrl}/status");
            
            if (!$healthResponse->successful() || $healthResponse->json('status') !== 'ready') {
                Log::warning('[WhatsApp] WA Server melapor tidak siap atau error.', [
                    'status' => $healthResponse->json('status'),
                    'http_code' => $healthResponse->status()
                ]);
                return false;
            }

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
                if (app()->isProduction()) {
                    Log::info('WhatsApp: pesan terkirim', ['to_suffix' => strlen($target) > 4 ? '***'.substr($target, -4) : '***']);
                } else {
                    Log::info("WhatsApp: Terkirim ke {$target}.");
                }
            } else {
                Log::warning('WhatsApp: Gagal mengirim (API Error)', [
                    'target_suffix' => strlen($target) > 4 ? '***'.substr($target, -4) : '***',
                    'http_status' => $response->status(),
                    'error' => $response->json('error')
                ]);
            }

            return $ok;
        } catch (\Throwable $e) {
            Log::error('WhatsApp: Exception saat menghubungi WA Server', [
                'message' => $e->getMessage(),
                'url' => $this->waServerUrl,
                'suggestion' => 'Pastikan wa-server berjalan di port yang benar dan tidak terhalang firewall/container isolation.'
            ]);

            return false;
        }
    }
}
