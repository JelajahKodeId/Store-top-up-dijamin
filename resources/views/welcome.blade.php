<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mall Store Topup Game</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-primary-950 text-gray-200 font-sans antialiased min-h-screen flex flex-col selection:bg-accent selection:text-primary-900">
    <!-- Navbar -->
    <nav class="fixed top-0 w-full z-50 bg-primary-950/80 backdrop-blur-md border-b border-primary-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <!-- Logo -->
                <div class="flex-shrink-0 flex items-center gap-3 cursor-pointer transition-transform hover:scale-105">
                    <img class="h-10 w-auto rounded-xl shadow-lg border border-primary-700/50" src="{{ asset('images/logo.jpeg') }}" alt="Mall Store Logo">
                    <span class="font-bold text-xl tracking-wide text-white">Mall Store</span>
                </div>
                
                <!-- Desktop Menu -->
                <div class="hidden md:block">
                    <div class="ml-10 flex items-baseline space-x-8">
                        <a href="#" class="text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                        <a href="#" class="text-gray-300 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">Games</a>
                        <a href="#" class="text-gray-300 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">Vouchers</a>
                        <a href="#" class="text-gray-300 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">Promo</a>
                    </div>
                </div>

                <!-- Auth Buttons -->
                <div class="hidden md:flex items-center gap-4">
                    @auth
                        <a href="{{ url('/dashboard') }}" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="px-5 py-2.5 rounded-full bg-accent text-primary-950 font-semibold text-sm hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,204,0,0.3)] hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] transform hover:-translate-y-0.5">Register</a>
                        @endif
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <main class="flex-grow flex items-center justify-center pt-28 pb-16 relative overflow-hidden">
        <!-- Background decorative elements -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div class="text-center max-w-3xl mx-auto">
                {{-- Dynamic Badge --}}
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-800/50 border border-primary-700/50 backdrop-blur-sm mb-8 animate-[pulse_3s_ease-in-out_infinite]">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                    <span class="text-sm font-medium text-gray-300">Fastest Top-up Platform in Indonesia</span>
                </div>

                <h1 class="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                    Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">Mall Store</span> 
                    <br/><span class="text-accent">Topup Game</span>
                </h1>
                
                <p class="mt-4 text-lg md:text-xl text-gray-400 mb-10 font-light leading-relaxed">
                    Level up your gaming experience instantly. Trusted by millions of gamers, we provide the best deals and fastest transactions for all your favorite games.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="#games" class="px-8 py-4 rounded-full bg-accent text-primary-950 font-bold text-lg hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(255,204,0,0.2)] hover:shadow-[0_0_30px_rgba(255,204,0,0.4)] transform hover:-translate-y-1 w-full sm:w-auto">
                        Explore Games
                    </a>
                    <a href="#" class="px-8 py-4 rounded-full bg-primary-800/80 text-white border border-primary-700 hover:bg-primary-700 transition-all font-semibold text-lg hover:border-primary-600 transform hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2">
                        View Tutorial
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </a>
                </div>
            </div>

            <!-- Featured Games Section -->
            <div id="games" class="mt-24">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                        <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                        Trending Now
                    </h2>
                    <a href="#" class="text-accent text-sm font-medium hover:text-yellow-400 transition-colors flex items-center gap-1">
                        View All
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </a>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    @php
                        $dummyGames = [
                            ['name' => 'Mobile Legends', 'pub' => 'Moonton'],
                            ['name' => 'Free Fire', 'pub' => 'Garena'],
                            ['name' => 'PUBG Mobile', 'pub' => 'Tencent'],
                            ['name' => 'Valorant', 'pub' => 'Riot Games']
                        ];
                    @endphp
                    @foreach($dummyGames as $game)
                    <div class="group relative bg-primary-900/50 rounded-2xl border border-primary-800/50 p-4 hover:bg-primary-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-primary-600/50 cursor-pointer overflow-hidden backdrop-blur-sm">
                        <div class="absolute inset-0 bg-gradient-to-br from-primary-800/0 to-primary-800/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="aspect-square bg-primary-800 rounded-xl mb-4 overflow-hidden relative">
                            <!-- Placeholder for Game Image -->
                            <div class="absolute inset-0 flex items-center justify-center text-primary-600 font-bold text-4xl group-hover:scale-110 transition-transform duration-500">
                                {{ substr($game['name'], 0, 1) }}
                            </div>
                        </div>
                        <h3 class="font-bold text-gray-100 group-hover:text-accent transition-colors">{{ $game['name'] }}</h3>
                        <p class="text-xs text-primary-400 mt-1">{{ $game['pub'] }}</p>
                    </div>
                    @endforeach
                </div>
            </div>
            
            <!-- Features Grid -->
            <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-primary-800/50 pt-16">
                <div class="bg-primary-900/30 p-8 rounded-3xl border border-primary-800/30 hover:border-primary-700/50 transition-colors">
                    <div class="w-14 h-14 bg-primary-800 rounded-2xl flex items-center justify-center mb-6 text-accent">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">Instant Delivery</h3>
                    <p class="text-gray-400 leading-relaxed text-sm">Your items will be delivered to your account within seconds after payment is confirmed.</p>
                </div>
                <div class="bg-primary-900/30 p-8 rounded-3xl border border-primary-800/30 hover:border-primary-700/50 transition-colors">
                    <div class="w-14 h-14 bg-primary-800 rounded-2xl flex items-center justify-center mb-6 text-accent">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">100% Secure</h3>
                    <p class="text-gray-400 leading-relaxed text-sm">We use top-tier encryption and trusted payment gateways to protect your transactions.</p>
                </div>
                <div class="bg-primary-900/30 p-8 rounded-3xl border border-primary-800/30 hover:border-primary-700/50 transition-colors">
                    <div class="w-14 h-14 bg-primary-800 rounded-2xl flex items-center justify-center mb-6 text-accent">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">24/7 Support</h3>
                    <p class="text-gray-400 leading-relaxed text-sm">Our customer service team is always ready to help you anytime, anywhere.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-primary-950 border-t border-primary-800/50 py-12 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex items-center justify-center gap-3 mb-6 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <img class="h-8 w-auto rounded border border-primary-700/50" src="{{ asset('images/logo.jpeg') }}" alt="Mall Store Logo">
                <span class="font-bold text-lg text-white">Mall Store</span>
            </div>
            <p class="text-primary-500 text-sm mb-4">
                &copy; {{ date('Y') }} Mall Store Topup Game. All rights reserved.
            </p>
            <div class="flex justify-center space-x-6 text-sm text-primary-500">
                <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" class="hover:text-white transition-colors">Contact Us</a>
            </div>
        </div>
    </footer>
</body>
</html>
