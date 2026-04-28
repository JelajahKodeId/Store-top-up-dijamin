@component('mail::message')
# Halo, Gamer!

Terima kasih telah mendaftar di **{{ config('app.name') }}**. Kami mendeteksi upaya pendaftaran akun menggunakan alamat email ini.

Silakan gunakan kode verifikasi di bawah ini untuk mengaktifkan akun Anda:

@component('mail::panel')
<div style="text-align: center;">
<h1 style="margin: 0; font-size: 42px; letter-spacing: 12px; color: #fbbf24;">{{ $otp }}</h1>
</div>
@endcomponent

Kode OTP ini bersifat rahasia dan akan kedaluwarsa dalam **15 menit**.

Jika Anda tidak merasa mendaftar di layanan kami, Anda dapat mengabaikan email ini dengan aman.

Salam,<br>
Tim {{ config('app.name') }}
@endcomponent
