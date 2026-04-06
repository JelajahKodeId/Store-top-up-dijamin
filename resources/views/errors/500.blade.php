<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 — Kesalahan Server</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
            background: #1E2028;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .container {
            text-align: center;
            max-width: 480px;
        }
        .code {
            font-family: 'Bebas Neue', cursive;
            font-size: clamp(80px, 20vw, 140px);
            font-weight: 400;
            color: #f87171;
            line-height: 1.05;
            letter-spacing: 2px;
            opacity: 0.8;
        }
        .title {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            font-weight: 700;
            color: rgba(255,255,255,0.75);
            margin: 16px 0 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .desc {
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: rgba(255,255,255,0.35);
            line-height: 1.7;
            margin-bottom: 36px;
        }
        .btn {
            display: inline-block;
            padding: 12px 32px;
            background: #FACC15;
            color: #13151C;
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2.5px;
            border-radius: 12px;
            text-decoration: none;
            transition: opacity 0.2s, transform 0.2s;
        }
        .btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .divider {
            width: 40px;
            height: 3px;
            background: #f87171;
            border-radius: 2px;
            margin: 20px auto;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="code">500</div>
        <div class="divider"></div>
        <h1 class="title">Kesalahan Server</h1>
        <p class="desc">
            Terjadi kesalahan internal di server kami.<br>
            Tim teknis sudah diberitahu. Silakan coba beberapa saat lagi.
        </p>
        <a href="/" class="btn">Kembali ke Beranda</a>
    </div>
</body>
</html>
