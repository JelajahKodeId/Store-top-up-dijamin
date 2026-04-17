<?php

namespace App\Services\Admin;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    private function normalizedImage(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return trim($value);
    }

    private function normalizedTelegramUrl(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        $v = trim($value);

        return $v === '' ? null : $v;
    }

    private function normalizedGameCategory(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        $v = strtolower(trim($value));

        return $v === '' ? null : $v;
    }

    /**
     * Create new product with dynamic fields and durations
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'image' => $this->normalizedImage($data['image'] ?? null),
                'telegram_group_invite_url' => $this->normalizedTelegramUrl($data['telegram_group_invite_url'] ?? null),
                'status' => $data['status'],
                'platform_type' => $data['platform_type'] ?? null,
                'game_category' => $this->normalizedGameCategory($data['game_category'] ?? null),
            ]);

            if (isset($data['fields'])) {
                foreach ($data['fields'] as $field) {
                    $product->fields()->create($field);
                }
            }

            if (isset($data['durations'])) {
                foreach ($data['durations'] as $duration) {
                    $product->durations()->create($duration);
                }
            }

            return $product;
        });
    }

    /**
     * Update product and sync fields/durations
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->update([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'image' => $this->normalizedImage($data['image'] ?? null),
                'telegram_group_invite_url' => $this->normalizedTelegramUrl($data['telegram_group_invite_url'] ?? null),
                'status' => $data['status'],
                'platform_type' => $data['platform_type'] ?? null,
                'game_category' => $this->normalizedGameCategory($data['game_category'] ?? null),
            ]);

            // Sync Fields — hapus yang tidak ada di payload, lalu upsert
            if (isset($data['fields'])) {
                $fieldIds = collect($data['fields'])->pluck('id')->filter()->toArray();
                $product->fields()->whereNotIn('id', $fieldIds)->delete();
                foreach ($data['fields'] as $field) {
                    if (! empty($field['id'])) {
                        // Hanya update jika field memang milik produk ini
                        $existing = $product->fields()->find((int) $field['id']);
                        if ($existing) {
                            $existing->update($field);
                        }
                    } else {
                        $product->fields()->create($field);
                    }
                }
            } else {
                // Jika fields tidak dikirim sama sekali, hapus semua field produk ini
                $product->fields()->delete();
            }

            // Sync Durations — hapus yang tidak ada di payload, lalu upsert
            if (isset($data['durations'])) {
                $durationIds = collect($data['durations'])->pluck('id')->filter()->toArray();
                // Jangan hapus durasi yang masih punya key terjual
                $product->durations()
                    ->whereNotIn('id', $durationIds)
                    ->whereDoesntHave('keys', fn ($q) => $q->where('status', 'sold'))
                    ->delete();
                foreach ($data['durations'] as $duration) {
                    if (! empty($duration['id'])) {
                        $existing = $product->durations()->find((int) $duration['id']);
                        if ($existing) {
                            $existing->update($duration);
                        }
                    } else {
                        $product->durations()->create($duration);
                    }
                }
            }

            return $product;
        });
    }

    /**
     * Delete product only if no successful sales exist
     */
    public function deleteProduct(Product $product): bool
    {
        if ($product->keys()->where('status', 'sold')->exists()) {
            throw new \Exception('Produk tidak dapat dihapus karena sudah memiliki riwayat penjualan.');
        }

        $path = $product->getRawOriginal('image');
        if (Product::isRelativeStoragePath($path)) {
            Storage::disk('public')->delete($path);
        }

        return $product->delete();
    }
}
