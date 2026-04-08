<?php

namespace Tests\Unit;

use App\Support\WhatsAppGateway;
use PHPUnit\Framework\TestCase;

class WhatsAppGatewayTest extends TestCase
{
    public function test_normalize_server_url_rejects_non_http_scheme(): void
    {
        $this->assertNull(WhatsAppGateway::normalizeServerUrl('ftp://127.0.0.1/x', false));
    }

    public function test_normalize_server_url_rejects_metadata_host(): void
    {
        $this->assertNull(WhatsAppGateway::normalizeServerUrl('http://metadata.google.internal/', false));
    }

    public function test_normalize_server_url_rejects_link_local_ipv4(): void
    {
        $this->assertNull(WhatsAppGateway::normalizeServerUrl('http://169.254.169.254/latest/meta-data/', false));
    }

    public function test_normalize_server_url_accepts_localhost_http_when_not_strict(): void
    {
        $this->assertSame(
            'http://127.0.0.1:3000',
            WhatsAppGateway::normalizeServerUrl('http://127.0.0.1:3000/', false)
        );
    }

    public function test_normalize_server_url_strict_rejects_http_public_hostname(): void
    {
        $this->assertNull(WhatsAppGateway::normalizeServerUrl('http://wa.example.com', true));
    }

    public function test_normalize_server_url_strict_allows_private_ipv4_http(): void
    {
        $this->assertSame(
            'http://10.0.0.5:3000',
            WhatsAppGateway::normalizeServerUrl('http://10.0.0.5:3000', true)
        );
    }

    public function test_normalize_recipient_strips_and_converts_indonesia_prefix(): void
    {
        $this->assertSame('6281234567890', WhatsAppGateway::normalizeRecipientNumber('081234567890'));
        $this->assertSame('6281234567890', WhatsAppGateway::normalizeRecipientNumber('+62 812-3456-7890'));
    }

    public function test_normalize_recipient_rejects_too_short(): void
    {
        $this->assertNull(WhatsAppGateway::normalizeRecipientNumber('081'));
    }
}
