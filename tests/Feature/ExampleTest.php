<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_returns_successful_response(): void
    {
        $this->get('/')->assertStatus(200);
    }

    public function test_catalog_page_returns_successful_response(): void
    {
        $this->get('/catalog')->assertStatus(200);
    }

    public function test_track_invoice_page_returns_successful_response(): void
    {
        $this->get('/track-invoice')->assertStatus(200);
    }
}
