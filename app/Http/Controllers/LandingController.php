<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\CatalogService;
use App\Services\Payment\PaymentGatewayInterface;
use App\Support\PaymentLabels;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService,
        protected PaymentGatewayInterface $paymentGateway,
    ) {}

    /**
     * Display the landing page with products.
     */
    public function index(): Response
    {
        return Inertia::render('Guest/Home', [
            'products' => $this->catalogService->getActiveProducts(),
            'banners' => $this->catalogService->getActiveBanners(),
        ]);
    }

    /**
     * Display the catalog page.
     */
    public function catalog(): Response
    {
        return Inertia::render('Guest/Catalog', [
            'products' => $this->catalogService->getActiveProducts(),
        ]);
    }

    /**
     * Display product detail page.
     */
    public function show(string $slug): Response
    {
        $product = $this->catalogService->getProductDetails($slug);

        if (! $product) {
            abort(404);
        }

        $related = $this->catalogService->getRelatedProducts($product);
        $paymentChannels = $this->paymentGateway->getPaymentChannels();

        $gateway = $this->paymentGateway->getGatewayName();

        return Inertia::render('Guest/ProductDetail', [
            'product' => $product,
            'related' => $related,
            'paymentChannels' => $paymentChannels,
            'checkoutGateway' => $gateway,
            'midtransSandboxMode' => $gateway === 'midtrans'
                && ! filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    /**
     * Display tracking invoice page.
     */
    public function trackInvoice(): Response
    {
        return Inertia::render('Guest/TrackInvoice');
    }

    /**
     * Halaman status order customer setelah checkout.
     * GET /orders/{invoice}
     */
    public function orderStatus(string $invoice): Response
    {
        $order = Order::where('invoice_code', $invoice)
            ->with(['items.product', 'items.orderKeys', 'payment'])
            ->first();

        if (! $order) {
            abort(404, 'Invoice tidak ditemukan.');
        }

        return Inertia::render('Guest/OrderStatus', [
            'order' => $this->formatOrderForFrontend($order),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Search order by invoice code.
     * Jika ditemukan → redirect ke halaman status order (satu sumber kebenaran).
     * Jika tidak → kembali ke TrackInvoice dengan pesan error.
     */
    public function trackInvoiceSearch(Request $request)
    {
        $request->validate([
            'invoice' => ['required', 'string', 'max:100'],
        ]);

        $invoice = strtoupper(trim($request->invoice));

        $order = Order::where('invoice_code', $invoice)->first();

        if (! $order) {
            return Inertia::render('Guest/TrackInvoice', [
                'not_found' => true,
                'search_invoice' => $invoice,
            ]);
        }

        return redirect()->route('orders.status', $invoice);
    }

    /**
     * Format order data untuk dikirim ke frontend (reusable).
     *
     * PRIVASI: key_code tidak pernah dikirim ke halaman web.
     * Key hanya dikirim via WhatsApp ke nomor pembeli.
     */
    protected function formatOrderForFrontend(Order $order): array
    {
        $order->loadMissing(['items.orderKeys', 'items.product', 'payment']);

        $payment = $order->payment;
        $midtransSnapToken = null;
        $midtransClientKey = null;
        $midtransSnapJs = null;

        if ($order->status === OrderStatus::UNPAID && $payment && $payment->gateway === 'midtrans') {
            $payload = $payment->payload ?? [];
            $midtransSnapToken = $payload['snap_token'] ?? $payload['token'] ?? null;
            $midtransClientKey = config('services.midtrans.client_key') ?: null;
            $midtransSnapJs = filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN)
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js';
        }

        $canOpenPayment = false;
        if ($order->status === OrderStatus::UNPAID) {
            if ($payment && $payment->gateway === 'midtrans') {
                $canOpenPayment = (bool) (($midtransSnapToken && $midtransClientKey) || $order->payment_url);
            } elseif ($payment) {
                $canOpenPayment = (bool) $order->payment_url;
            }
        }

        $midtransSandbox = $payment && $payment->gateway === 'midtrans'
            && ! filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN);

        return [
            'invoice_code' => $order->invoice_code,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'status_color' => $order->status->color(),
            'total_price' => $order->total_price,
            'discount_amount' => $order->discount_amount ?? 0,
            'customer_name' => $order->customer_name,
            // customer_email tidak dikirim ke frontend — tidak dikumpulkan dari guest
            'whatsapp' => $order->whatsapp_number,
            'payment_method' => $order->payment_method,
            'payment_method_label' => PaymentLabels::methodLabel($order->payment_method, $payment?->gateway),
            'payment_gateway' => $payment?->gateway,
            'payment_url' => $order->payment_url,
            'midtrans_snap_token' => $midtransSnapToken,
            'midtrans_client_key' => $midtransClientKey,
            'midtrans_snap_js' => $midtransSnapJs,
            'midtrans_is_sandbox' => $midtransSandbox,
            'needs_payment_help' => $order->status === OrderStatus::UNPAID && ! $canOpenPayment,
            'payment_expired_at' => $order->payment_expired_at?->toISOString(),
            'created_at' => $order->created_at->format('d M Y, H:i'),
            'items' => $order->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'duration_name' => $item->duration_name,
                'price' => $item->price,
                'quantity' => $item->quantity,
                // Hanya jumlah key yang dikirim — key_code TIDAK dikirim ke web (privasi)
                'keys_delivered' => $item->orderKeys->count(),
            ]),
        ];
    }
}
