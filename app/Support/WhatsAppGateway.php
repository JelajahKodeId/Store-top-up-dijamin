<?php

namespace App\Support;

/**
 * Validasi URL gateway WA (server-to-server) dan normalisasi nomor penerima.
 */
class WhatsAppGateway
{
    /**
     * Normalisasi & validasi URL wa-server. Mencegah skema berbahaya dan host metadata cloud.
     *
     * @param  bool  $strictTransport  true di production: HTTP hanya untuk localhost / IP privat / ::1
     */
    public static function normalizeServerUrl(?string $url, bool $strictTransport = false): ?string
    {
        if (! is_string($url) || trim($url) === '') {
            return null;
        }

        $trimmed = rtrim(trim($url), '/');
        $parts = parse_url($trimmed);
        if ($parts === false || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $scheme = strtolower((string) $parts['scheme']);
        if (! in_array($scheme, ['http', 'https'], true)) {
            return null;
        }

        $host = strtolower((string) $parts['host']);

        if ($host === 'metadata.google.internal' || str_ends_with($host, '.metadata.google.internal')) {
            return null;
        }

        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $long = ip2long($host);
            if ($long !== false && self::isLinkLocalIpv4Long($long)) {
                return null;
            }
        }

        if ($strictTransport && $scheme === 'http' && ! self::isHttpHostAllowedOnPrivateNetwork($host)) {
            return null;
        }

        return $trimmed;
    }

    /**
     * Nomor untuk dikirim ke wa-server: hanya digit, awalan Indonesia 0→62, panjang wajar.
     */
    public static function normalizeRecipientNumber(string $input): ?string
    {
        $digits = preg_replace('/\D/', '', $input);
        if ($digits === null || $digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        $len = strlen($digits);
        if ($len < 10 || $len > 15) {
            return null;
        }

        return $digits;
    }

    protected static function isLinkLocalIpv4Long(int $long): bool
    {
        $a = ($long >> 24) & 0xFF;

        return $a === 169;
    }

    protected static function isHttpHostAllowedOnPrivateNetwork(string $host): bool
    {
        if (in_array($host, ['127.0.0.1', 'localhost'], true)) {
            return true;
        }

        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return self::isPrivateOrLoopbackIpv4($host);
        }

        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            return $host === '::1';
        }

        return false;
    }

    protected static function isPrivateOrLoopbackIpv4(string $host): bool
    {
        if (! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return false;
        }

        $long = ip2long($host);
        if ($long === false) {
            return false;
        }

        if ($long === ip2long('127.0.0.1')) {
            return true;
        }

        $a = ($long >> 24) & 0xFF;
        $b = ($long >> 16) & 0xFF;

        if ($a === 10) {
            return true;
        }

        if ($a === 172 && $b >= 16 && $b <= 31) {
            return true;
        }

        if ($a === 192 && $b === 168) {
            return true;
        }

        return false;
    }
}
