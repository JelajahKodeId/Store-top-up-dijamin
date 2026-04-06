<?php

namespace App\Console\Commands;

use App\Models\ProductKey;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MarkExpiredKeys extends Command
{
    protected $signature = 'keys:mark-expired';
    protected $description = 'Tandai ProductKey yang sudah melewati expires_at menjadi status expired';

    public function handle(): int
    {
        $count = ProductKey::where('status', 'sold')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        Log::info("MarkExpiredKeys: {$count} key ditandai expired.");
        $this->info("{$count} key berhasil ditandai expired.");

        return self::SUCCESS;
    }
}
