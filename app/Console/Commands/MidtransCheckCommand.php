<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MidtransCheckCommand extends Command
{
    protected $signature = 'midtrans:check';

    protected $description = 'Validasi konfigurasi Midtrans (sandbox/production) untuk uji transaksi';

    public function handle(): int
    {
        $driver = (string) config('services.payment.driver');
        $server = (string) config('services.midtrans.server_key');
        $client = (string) config('services.midtrans.client_key');
        $prod = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);
        $appUrl = (string) config('app.url');
        $allowProdLocal = filter_var(config('services.midtrans.allow_production_in_local'), FILTER_VALIDATE_BOOLEAN);

        $this->info('PAYMENT_GATEWAY: '.$driver);

        if ($driver !== 'midtrans') {
            $this->warn('Driver bukan midtrans — perintah ini fokus ke Midtrans.');
        }

        if ($server === '' || $client === '') {
            $this->error('MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY kosong. Isi kunci dari dashboard Midtrans (sandbox untuk uji).');

            return self::FAILURE;
        }

        $this->line('Mode API: '.($prod ? 'PRODUCTION' : 'SANDBOX'));
        $this->line('APP_URL: '.$appUrl);

        $sbS = str_starts_with($server, 'SB-Mid-server-');
        $sbC = str_starts_with($client, 'SB-Mid-client-');
        if (! $prod) {
            if (! $sbS) {
                $this->warn('Server key tidak diawali SB-Mid-server- — pastikan ini kunci sandbox.');
            }
            if (! $sbC) {
                $this->warn('Client key tidak diawali SB-Mid-client- — pastikan ini kunci sandbox.');
            }
        } else {
            if (str_starts_with($server, 'SB-Mid-server-')) {
                $this->error('MIDTRANS_IS_PRODUCTION=true tetapi server key sandbox (SB-Mid-server-).');

                return self::FAILURE;
            }
            if (str_starts_with($client, 'SB-Mid-client-')) {
                $this->error('MIDTRANS_IS_PRODUCTION=true tetapi client key sandbox (SB-Mid-client-).');

                return self::FAILURE;
            }
        }

        if (app()->environment('local') && $prod && ! $allowProdLocal) {
            $this->error('APP_ENV=local + MIDTRANS_IS_PRODUCTION=true tanpa MIDTRANS_ALLOW_PRODUCTION_IN_LOCAL akan gagal saat create transaksi.');

            return self::FAILURE;
        }

        $notify = route('webhooks.payment', [], true);
        $this->line('Notification URL (harus dapat dijangkau Midtrans): '.$notify);
        if (str_contains($appUrl, 'localhost') || str_contains($appUrl, '127.0.0.1')) {
            $this->warn('APP_URL mengarah ke localhost — notifikasi HTTP Midtrans biasanya tidak sampai. Uji webhook pakai ngrok / Cloudflare Tunnel, atau Simulator di dashboard Midtrans sandbox.');
        }

        $this->info('Keamanan: webhook memverifikasi signature_key SHA512; CSRF dikecualikan hanya untuk /webhooks/*');

        return self::SUCCESS;
    }
}
