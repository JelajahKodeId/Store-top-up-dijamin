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
use Illuminate\Http\RedirectResponse;

class LandingController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService,
        protected PaymentGatewayInterface $paymentGateway,
    ) {}

    /**
     * Display the landing page with products.
     */
    public function index(Request $request): Response
    {
        $category = $this->resolveGameCategoryQuery($request);

        return Inertia::render('Guest/Home', [
            'products' => $this->catalogService->getActiveProducts($category),
            'vouchers' => \App\Models\Voucher::active()->with('products:id,name,game_category')->get()->map(fn($v) => [
                'code' => $v->code,
                'products' => $v->products->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'game_category' => $p->game_category,
                ]),
            ]),
            'banners' => $this->catalogService->getActiveBanners()->map(fn($b) => [
                'id' => $b->id,
                'title' => $b->title,
                'image_url' => $b->image_url,
                'link' => $b->link,
                'is_active' => $b->is_active,
            ]),
            'gameCategories' => $this->catalogService->getActiveGameCategoriesForFilter(),
            'filters' => [
                'category' => $category,
            ],
        ]);
    }

    /**
     * Display the catalog page.
     */
    public function catalog(Request $request): Response
    {
        $category = $this->resolveGameCategoryQuery($request);

        return Inertia::render('Guest/Catalog', [
            'title' => 'Katalog Produk',
            'subtitle' => 'Eksplorasi produk digital premium dengan pengiriman instan',
            'products' => $this->catalogService->getActiveProducts($category),
            'vouchers' => \App\Models\Voucher::active()->with('products:id,name,game_category')->get()->map(fn($v) => [
                'code' => $v->code,
                'products' => $v->products->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'game_category' => $p->game_category,
                ]),
            ]),
            'gameCategories' => $this->catalogService->getActiveGameCategoriesForFilter(),
            'filters' => [
                'category' => $category,
            ],
        ]);
    }

    /**
     * Query `?category=mlbb` — aman untuk produksi (slug kecil, opsional).
     */
    protected function resolveGameCategoryQuery(Request $request): ?string
    {
        $raw = $request->query('category');
        if (! is_string($raw)) {
            return null;
        }
        $v = strtolower(trim($raw));
        if ($v === '' || ! preg_match('/^[a-z0-9][a-z0-9_-]{0,39}$/', $v)) {
            return null;
        }

        return $v;
    }

    /**
     * Display product detail page.
     */
    public function show(Request $request, string $slug): Response|RedirectResponse
    {
        $product = $this->catalogService->getProductDetails($slug);

        if (! $product) {
            abort(404);
        }

        if ($product->platform_type === 'maintenance') {
            return redirect()->route('catalog')->with('error', 'Produk "' . $product->name . '" sedang dalam pemeliharaan (maintenance).');
        }

        $related = $this->catalogService->getRelatedProducts($product);
        $paymentChannels = $this->paymentGateway->getPaymentChannels();
        
        $manualMethods = \App\Models\ManualPaymentMethod::where('is_active', true)->get()->map(function ($m) {
            return [
                'code' => 'manual_' . $m->id,
                'label' => $m->name,
                'icon_url' => $m->image_url,
            ];
        })->toArray();

        $paymentChannels = array_merge($paymentChannels, $manualMethods);

        $gateway = $this->paymentGateway->getGatewayName();

        $invoiceHint = $request->query('invoice');
        $reviewInvoice = is_string($invoiceHint) ? strtoupper(trim($invoiceHint)) : null;
        if ($reviewInvoice === '') {
            $reviewInvoice = null;
        }

        return Inertia::render('Guest/ProductDetail', [
            'product' => $product,
            'related' => $related,
            'paymentChannels' => $paymentChannels,
            'checkoutGateway' => $gateway,
            'midtransSandboxMode' => $gateway === 'midtrans'
                && ! filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOLEAN),
            'reviewInvoice' => $reviewInvoice,
            'testimonials' => \App\Models\ProductReview::with('product:id,name')->where('is_published', true)->orderByDesc('created_at')->limit(50)->get(),
        ]);
    }

    /**
     * Display tracking invoice page.
     */
    public function trackInvoice(): Response
    {
        return Inertia::render('Guest/TrackInvoice', [
            'title' => 'Lacak Pesanan',
            'subtitle' => 'Periksa status transaksi Anda secara real-time',
        ]);
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
            'title' => 'Status Pesanan',
            'subtitle' => "Invoice #{$order->invoice_code}",
            'order' => $this->formatOrderForFrontend($order),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'whatsapp_url' => session('whatsapp_url'),
            ],
            'app_env' => app()->environment(),
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
        // Direct Payment Payload (Pak Kasir / Genspay)
        $directPaymentDetails = null;
        if ($order->status === OrderStatus::UNPAID && $payment) {
            $p = $payment->payload['payment'] ?? $payment->payload ?? [];
            if ($payment->gateway === 'pak_kasir' && isset($p['payment_number'])) {
                $directPaymentDetails = [
                    'number' => $p['payment_number'],
                    'total_payment' => $p['total_payment'] ?? $p['amount'] ?? $order->total_price,
                    'method' => $p['payment_method'] ?? $order->payment_method,
                    'is_qris' => str_contains(strtolower($p['payment_method'] ?? ''), 'qris'),
                    'qr_url' => null,
                ];
            } elseif ($payment->gateway === 'genspay') {
                if (isset($p['qr_string'])) {
                    $directPaymentDetails = [
                        'number' => $p['qr_string'],
                        'total_payment' => $p['amount'] ?? $order->total_price,
                        'method' => 'QRIS',
                        'is_qris' => true,
                        'qr_url' => null, // We'll generate QR client-side from qr_string
                    ];
                } elseif (isset($p['pay_address'])) {
                    $directPaymentDetails = [
                        'number' => $p['pay_address'],
                        'total_payment' => $p['pay_amount'],
                        'method' => 'USDT (BSC)',
                        'is_qris' => false,
                        'qr_url' => null,
                    ];
                }
            }
        }

        $canOpenPayment = false;
        if ($order->status === OrderStatus::UNPAID) {
            if ($payment) {
                $canOpenPayment = (bool) $order->payment_url;
            }
        }

        $manualPaymentDetails = null;
        if ($order->status === OrderStatus::UNPAID && $payment && $payment->gateway === 'manual') {
            $manualPaymentDetails = $payment->payload;
        }

        return [
            'invoice_code' => $order->invoice_code,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'status_color' => $order->status->color(),
            'total_price' => $order->total_price,
            'fee_amount' => $order->fee_amount ?? 0,
            'discount_amount' => $order->discount_amount ?? 0,
            'customer_name' => $order->customer_name,
            // customer_email tidak dikirim ke frontend — tidak dikumpulkan dari guest
            'whatsapp' => $order->whatsapp_number,
            'payment_method' => $order->payment_method,
            'payment_method_label' => PaymentLabels::methodLabel($order->payment_method, $payment?->gateway),
            'payment_gateway' => $payment?->gateway,
            'payment_url' => $order->payment_url,
            'direct_payment_details' => $directPaymentDetails,
            'manual_payment_details' => $manualPaymentDetails,
            'needs_payment_help' => $order->status === OrderStatus::UNPAID && ! $canOpenPayment && ! $directPaymentDetails && ! $manualPaymentDetails,
            'payment_expired_at' => $order->payment_expired_at?->toISOString(),
            'created_at' => $order->created_at->format('d M Y, H:i'),
            'items' => $order->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'product_slug' => $item->product?->slug,
                'duration_name' => $item->duration_name,
                'price' => $item->price,
                'quantity' => $item->quantity,
                // Key list dikirim hanya jika status sudah PAID/SUCCESS
                'keys' => ($order->status === OrderStatus::SUCCESS || $order->status === OrderStatus::PAID)
                    ? $item->orderKeys->map(fn ($k) => ['key' => $k->key_code])
                    : [],
            ]),
        ];
    }

    /**
     * Get the most recent paid order for "Live Purchase" notification.
     * GET /api/recent-order
     */
    public function recentOrder()
    {
        $orders = Order::whereIn('status', [OrderStatus::PAID, OrderStatus::SUCCESS])
            ->whereHas('payment', function($q) {
                $q->whereNotNull('paid_at');
            })
            ->with(['items.product', 'payment'])
            ->latest('updated_at')
            ->take(10)
            ->get();

        if ($orders->isEmpty()) return response()->json(['order' => null]);
        
        $order = $orders->random();

        if (!$order || !$order->payment) return response()->json(['order' => null]);

        $item = $order->items->first();
        if (!$item) return response()->json(['order' => null]);

        $product = $item->product;

        return response()->json([
            'order' => [
                'id' => $order->id,
                'customer_name' => 'Seseorang', 
                'product_name' => $item->product_name,
                'product_image' => $product ? $product->image_url : null,
                'time_ago' => $order->payment->paid_at->diffForHumans(['parts' => 1, 'short' => true]),
                'paid_at' => $order->payment->paid_at->toIso8601String(),
            ]
        ]);
    }
}
