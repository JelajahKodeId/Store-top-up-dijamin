<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Slug kategori game pada produk (nullable — produk lama tidak wajib punya kategori).
 */
final class ProductGameCategory
{
    public static function label(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $v = strtolower(trim($value));

        return match ($v) {
            'mlbb', 'mobile-legends' => 'Mobile Legends',
            'roblox' => 'Roblox',
            'pubgm' => 'PUBG Mobile',
            'ff', 'free-fire' => 'Free Fire',
            'genshin', 'genshin-impact' => 'Genshin Impact',
            'valorant' => 'Valorant',
            'minecraft' => 'Minecraft',
            'steam' => 'Steam',
            'epic' => 'Epic Games',
            default => Str::title(str_replace(['-', '_'], ' ', $v)),
        };
    }

    /**
     * @param  list<string|null>  $slugs
     * @return list<array{value: string, label: string}>
     */
    public static function filterOptions(array $slugs): array
    {
        $unique = [];
        foreach ($slugs as $slug) {
            if ($slug === null || $slug === '') {
                continue;
            }
            $unique[(string) $slug] = true;
        }

        $out = [];
        foreach (array_keys($unique) as $slug) {
            $out[] = [
                'value' => $slug,
                'label' => self::label($slug) ?? $slug,
            ];
        }

        usort($out, fn ($a, $b) => strcmp($a['label'], $b['label']));

        return $out;
    }
}
