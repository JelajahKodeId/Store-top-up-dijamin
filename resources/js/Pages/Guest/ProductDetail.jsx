import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import { useState } from 'react';
import Button from '@/Components/ui/Button';
import GuestInput from '@/Components/guest/GuestInput';

export default function ProductDetail({ product }) {
    const [selectedDuration, setSelectedDuration] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        duration_id: '',
        whatsapp: '',
    });

    const handleSelectDuration = (duration) => {
        setSelectedDuration(duration);
        setData('duration_id', duration.id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    return (
        <GuestLayout title={product.name} subtitle={product.category?.name}>
            <Head title={`${product.name} — Mall Store`} />

            <div className="section-container pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: Product Image & Description */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Image */}
                        <div className="relative overflow-hidden rounded-[3rem] shadow-2xl border border-white/5 bg-store-charcoal-light group">
                            <div className="aspect-[3/4] overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-store-charcoal via-transparent to-transparent opacity-70" />
                            <div className="absolute top-6 left-6">
                                <span className="px-5 py-2 rounded-2xl bg-store-accent text-store-dark text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    {product.category?.name || 'Premium'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-5">
                            <h3 className="text-2xl font-black text-white font-bebas tracking-wide uppercase flex items-center gap-3">
                                <AppIcons.help size={20} className="text-store-accent" />
                                Deskripsi Produk
                            </h3>
                            <div
                                className="text-store-subtle text-sm leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: product.description || 'Nikmati akses premium instan untuk produk digital berkualitas tinggi.' }}
                            />
                            <div className="pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Metode</span>
                                    <span className="text-xs font-bold text-white uppercase">Otomatis / Instan</span>
                                </div>
                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Status</span>
                                    <span className="text-xs font-bold text-green-500 uppercase flex items-center justify-end gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                        Ready Stock
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Form */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Step 1: Select Duration */}
                        <div className="p-8 md:p-12 rounded-[3.5rem] bg-store-charcoal-light/50 border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-store-accent/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-store-accent/8 transition-all duration-700" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-16 h-16 rounded-3xl bg-store-accent/10 border border-store-accent/20 flex items-center justify-center text-store-accent">
                                        <AppIcons.zap size={32} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h3 className="section-heading">Pilih Varian</h3>
                                        <p className="text-store-subtle font-medium mt-1 uppercase tracking-widest text-[10px]">Tentukan paket durasi yang anda inginkan</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.durations?.map((duration) => (
                                        <button
                                            key={duration.id}
                                            type="button"
                                            onClick={() => handleSelectDuration(duration)}
                                            className={`relative p-8 rounded-[2rem] border-2 transition-all duration-500 text-left group/card overflow-hidden ${selectedDuration?.id === duration.id
                                                ? 'bg-store-accent/10 border-store-accent shadow-accent-glow'
                                                : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${selectedDuration?.id === duration.id ? 'text-store-accent' : 'text-white/20'
                                                    }`}>
                                                    {duration.duration_days ? `${duration.duration_days} Hari` : 'Durasi Paket'}
                                                </span>
                                                <h4 className="text-xl font-black text-white font-bebas tracking-wide group-hover/card:text-store-accent transition-colors uppercase">
                                                    {duration.name || `${duration.duration} ${duration.unit}`}
                                                </h4>
                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-2xl font-black text-white font-bebas tracking-tight">
                                                        Rp {number_format(duration.price, 0, ',', '.')}
                                                    </span>
                                                    {selectedDuration?.id === duration.id && (
                                                        <div className="text-store-accent">
                                                            <AppIcons.check size={22} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {errors.duration_id && (
                                    <p className="mt-6 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 px-6 rounded-2xl border border-red-500/20">
                                        {errors.duration_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Contact & Checkout */}
                        <div className={`transition-all duration-700 ${selectedDuration ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none translate-y-6'}`}>
                            <div className="p-8 md:p-12 rounded-[3.5rem] bg-store-charcoal-light/50 border border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/10 transition-all duration-700" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                            <AppIcons.mail size={32} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h3 className="section-heading">Kontak & Checkout</h3>
                                            <p className="text-store-subtle font-medium mt-1 uppercase tracking-widest text-[10px]">Informasi pengiriman kode lisensi</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <GuestInput
                                            label="Nomor WhatsApp (Aktif)"
                                            icon="globe"
                                            type="text"
                                            placeholder="0812XXXXXXXX"
                                            value={data.whatsapp}
                                            onChange={(e) => setData('whatsapp', e.target.value)}
                                            error={errors.whatsapp}
                                        />

                                        {/* Order Summary */}
                                        {selectedDuration && (
                                            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Total Pembayaran</span>
                                                    <span className="text-4xl font-black text-store-accent font-bebas tracking-tighter text-glow-accent">
                                                        Rp {number_format(selectedDuration.price, 0, ',', '.')}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center justify-end gap-1.5 mb-1">
                                                        <AppIcons.zap size={10} strokeWidth={4} /> Pengiriman Instan
                                                    </span>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sistem Automasi 24/7</span>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            disabled={processing || !selectedDuration}
                                            variant="accent"
                                            className="w-full py-6 rounded-[2rem] text-xl font-black uppercase tracking-[0.2em] shadow-accent-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 group/btn"
                                        >
                                            {processing ? 'Processing...' : 'Selesaikan Pembayaran'}
                                            <AppIcons.arrowRight size={24} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                                        </Button>
                                        <p className="text-center text-[10px] font-medium text-white/20 uppercase tracking-widest">
                                            Dengan melanjutkan, Anda menyetujui{' '}
                                            <span className="text-white/40 underline cursor-pointer hover:text-store-accent transition-colors">
                                                Syarat & Ketentuan
                                            </span>{' '}
                                            kami.
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

// Helper function
function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? '.' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? ',' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
