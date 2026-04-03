<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', config('app.name'))</title>
    <style>
        /* Reset */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #0f0f1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: #e2e8f0;
            -webkit-text-size-adjust: 100%;
        }

        /* Wrapper */
        .email-wrapper {
            width: 100%;
            padding: 32px 16px;
            background-color: #0f0f1a;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a2e;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #2d2d4e;
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
            padding: 32px 40px;
            text-align: center;
        }
        .email-header .brand-name {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        .email-header .brand-name span {
            color: #fde68a;
        }
        .email-header .header-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 99px;
            margin-top: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* Body */
        .email-body {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 12px;
        }
        .message-text {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 28px;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 99px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 28px;
        }
        .badge-unpaid  { background: #fef3c7; color: #92400e; }
        .badge-paid    { background: #d1fae5; color: #065f46; }
        .badge-success { background: #ede9fe; color: #4c1d95; }
        .badge-failed  { background: #fee2e2; color: #991b1b; }
        .badge-canceled{ background: #f3f4f6; color: #374151; }

        /* Order Detail Card */
        .order-card {
            background: #0f0f1a;
            border: 1px solid #2d2d4e;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .order-card-title {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #6366f1;
            margin-bottom: 16px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #2d2d4e;
            gap: 16px;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label {
            font-size: 13px;
            color: #64748b;
            flex-shrink: 0;
            min-width: 120px;
        }
        .detail-value {
            font-size: 13px;
            color: #e2e8f0;
            font-weight: 500;
            text-align: right;
        }
        .detail-value.highlight {
            color: #a78bfa;
            font-weight: 700;
            font-size: 15px;
        }
        .detail-value.trx-id {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: #1e1e3a;
            padding: 2px 8px;
            border-radius: 4px;
            color: #818cf8;
        }

        /* Alert Box */
        .alert-box {
            border-radius: 10px;
            padding: 16px 20px;
            margin: 20px 0;
            font-size: 13px;
            line-height: 1.6;
        }
        .alert-info {
            background: #1e3a5f;
            border-left: 4px solid #3b82f6;
            color: #93c5fd;
        }
        .alert-success {
            background: #1a2f2a;
            border-left: 4px solid #10b981;
            color: #6ee7b7;
        }
        .alert-warning {
            background: #2d2010;
            border-left: 4px solid #f59e0b;
            color: #fcd34d;
        }
        .alert-danger {
            background: #2d1010;
            border-left: 4px solid #ef4444;
            color: #fca5a5;
        }

        /* CTA Button */
        .btn-cta {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            padding: 14px 32px;
            border-radius: 10px;
            margin: 8px 0 24px;
            letter-spacing: 0.3px;
        }
        .center { text-align: center; }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid #2d2d4e;
            margin: 28px 0;
        }

        /* Footer */
        .email-footer {
            background: #0d0d1f;
            border-top: 1px solid #2d2d4e;
            padding: 24px 40px;
            text-align: center;
        }
        .footer-text {
            font-size: 12px;
            color: #475569;
            line-height: 1.8;
        }
        .footer-text a {
            color: #6366f1;
            text-decoration: none;
        }
        .footer-brand {
            font-size: 13px;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="email-container">

        {{-- Header --}}
        <div class="email-header">
            <div class="brand-name">Mall <span>Store</span> ⚡</div>
            <div class="header-badge">@yield('header_badge', 'Notifikasi Transaksi')</div>
        </div>

        {{-- Body --}}
        <div class="email-body">
            @yield('content')
        </div>

        {{-- Footer --}}
        <div class="email-footer">
            <div class="footer-brand">{{ config('app.name') }}</div>
            <div class="footer-text">
                Email ini dikirim secara otomatis oleh sistem kami.<br>
                Jangan membalas email ini.<br><br>
                Ada pertanyaan? Hubungi kami di
                <a href="mailto:support@mallstore.id">support@mallstore.id</a><br>
                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </div>
        </div>

    </div>
</div>
</body>
</html>
