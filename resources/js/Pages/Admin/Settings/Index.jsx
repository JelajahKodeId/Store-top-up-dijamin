import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Input, { Textarea } from '@/Components/ui/Input';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function SettingIndex({ settings }) {
    const [activeTab, setActiveTab] = useState('general');

    // Konversi array settings ke object key-value, dengan default untuk setiap key
    const SETTING_DEFAULTS = {
        site_name: '', site_description: '', site_keywords: '', announcement: '', running_text: '',
        logo_web: '', logo_footer: '', favicon: '',
        whatsapp_number: '', instagram_username: '', telegram_username: '', facebook_page: '', tiktok_username: '',
        contact_email: '', contact_phone: '', address: '',
    };
    const initialSettings = settings.reduce((acc, s) => {
        acc[s.key] = s.value ?? '';
        return acc;
    }, { ...SETTING_DEFAULTS });

    const { data, setData, post, processing, errors } = useForm({
        ...initialSettings,
        // File uploads diset null agar bisa deteksi upload baru
        logo_web: null,
        logo_footer: null,
        favicon: null,
    });

    const [previews, setPreviews] = useState({
        logo_web: initialSettings.logo_web,
        logo_footer: initialSettings.logo_footer,
        favicon: initialSettings.favicon,
    });

    const handleFileChange = (key, file) => {
        if (file) {
            setData(key, file);
            setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'general', label: 'Umum & SEO', icon: AppIcons.dashboard },
        { id: 'branding', label: 'Logo & Visual', icon: AppIcons.view },
        { id: 'social', label: 'Media Sosial', icon: AppIcons.plus },
        { id: 'contact', label: 'Kontak & Alamat', icon: AppIcons.categories },
    ];

    return (
        <AdminLayout
            title="Pengaturan Situs"
            subtitle="Konfigurasi identitas dan fitur platform"
        >
            <Head title="Pengaturan Situs" />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-none space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-store-charcoal text-white shadow-lux'
                                    : 'text-store-muted hover:bg-white hover:text-store-charcoal border border-transparent hover:border-store-border'
                                }`}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-store-border shadow-soft overflow-hidden">
                            {/* Tab Content: General */}
                            {activeTab === 'general' && (
                                <div className="p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-store-border pb-6">
                                        <h3 className="text-lg font-black text-store-charcoal uppercase tracking-tighter">Informasi Identitas</h3>
                                        <p className="text-xs text-store-subtle font-bold uppercase mt-1">Nama dan deskripsi publik situs Anda</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <Input
                                            label="Nama Situs"
                                            value={data.site_name}
                                            onChange={e => setData('site_name', e.target.value)}
                                            error={errors.site_name}
                                        />
                                        <Textarea
                                            label="Deskripsi Situs (SEO)"
                                            value={data.site_description}
                                            onChange={e => setData('site_description', e.target.value)}
                                            error={errors.site_description}
                                            rows={3}
                                        />
                                        <Input
                                            label="Keywords (SEO)"
                                            value={data.site_keywords}
                                            onChange={e => setData('site_keywords', e.target.value)}
                                            error={errors.site_keywords}
                                            placeholder="topup, game, voucher (pisahkan dengan koma)"
                                        />
                                        <Textarea
                                            label="Pengumuman (Landing Page)"
                                            value={data.announcement}
                                            onChange={e => setData('announcement', e.target.value)}
                                            error={errors.announcement}
                                            rows={4}
                                        />
                                        <Input
                                            label="Running Text (Beranda)"
                                            value={data.running_text}
                                            onChange={e => setData('running_text', e.target.value)}
                                            error={errors.running_text}
                                            placeholder="Teks berjalan di bawah banner..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab Content: Branding */}
                            {activeTab === 'branding' && (
                                <div className="p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-store-border pb-6">
                                        <h3 className="text-lg font-black text-store-charcoal uppercase tracking-tighter">Visual Platform</h3>
                                        <p className="text-xs text-store-subtle font-bold uppercase mt-1">Kelola logo dan identitas visual</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Logo Web */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">Logo Utama (Header)</label>
                                            <div className="aspect-[4/1] bg-admin-bg rounded-2xl border-2 border-dashed border-store-border relative overflow-hidden group flex items-center justify-center p-4">
                                                {previews.logo_web ? (
                                                    <img src={previews.logo_web} className="max-h-full object-contain" />
                                                ) : (
                                                    <AppIcons.view size={32} className="text-store-subtle" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                                    <span className="text-[10px] font-black text-white uppercase">Upload Logo Baru</span>
                                                </div>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange('logo_web', e.target.files[0])} />
                                            </div>
                                        </div>

                                        {/* Logo Footer */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">Logo Footer</label>
                                            <div className="aspect-[4/1] bg-store-charcoal rounded-2xl border-2 border-dashed border-white/20 relative overflow-hidden group flex items-center justify-center p-4">
                                                {previews.logo_footer ? (
                                                    <img src={previews.logo_footer} className="max-h-full object-contain" />
                                                ) : (
                                                    <div className="bg-white/10 p-4 rounded-xl">
                                                        <AppIcons.view size={24} className="text-white/40" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                                    <span className="text-[10px] font-black text-white uppercase">Upload Logo Footer</span>
                                                </div>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange('logo_footer', e.target.files[0])} />
                                            </div>
                                        </div>

                                        {/* Favicon */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">Favicon</label>
                                            <div className="w-24 h-24 bg-admin-bg rounded-2xl border-2 border-dashed border-store-border relative overflow-hidden group flex items-center justify-center p-4">
                                                {previews.favicon ? (
                                                    <img src={previews.favicon} className="w-full h-full object-contain" />
                                                ) : (
                                                    <AppIcons.categories size={24} className="text-store-subtle" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                                    <span className="text-[10px] font-black text-white uppercase">Ubah</span>
                                                </div>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange('favicon', e.target.files[0])} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Content: Social */}
                            {activeTab === 'social' && (
                                <div className="p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-store-border pb-6">
                                        <h3 className="text-lg font-black text-store-charcoal uppercase tracking-tighter">Media Sosial</h3>
                                        <p className="text-xs text-store-subtle font-bold uppercase mt-1">Tautkan akun sosial media platform Anda</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="WhatsApp Number (628...)"
                                            value={data.whatsapp_number}
                                            onChange={e => setData('whatsapp_number', e.target.value)}
                                            error={errors.whatsapp_number}
                                        />
                                        <Input
                                            label="Instagram Username"
                                            value={data.instagram_username}
                                            onChange={e => setData('instagram_username', e.target.value)}
                                            error={errors.instagram_username}
                                            placeholder="@store_topup"
                                        />
                                        <Input
                                            label="Telegram Username/Link"
                                            value={data.telegram_username}
                                            onChange={e => setData('telegram_username', e.target.value)}
                                            error={errors.telegram_username}
                                            placeholder="mallstore_cs"
                                        />
                                        <Input
                                            label="Facebook Page Name"
                                            value={data.facebook_page}
                                            onChange={e => setData('facebook_page', e.target.value)}
                                            error={errors.facebook_page}
                                        />
                                        <Input
                                            label="TikTok Username"
                                            value={data.tiktok_username}
                                            onChange={e => setData('tiktok_username', e.target.value)}
                                            error={errors.tiktok_username}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab Content: Contact */}
                            {activeTab === 'contact' && (
                                <div className="p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="border-b border-store-border pb-6">
                                        <h3 className="text-lg font-black text-store-charcoal uppercase tracking-tighter">Kontak & Alamat</h3>
                                        <p className="text-xs text-store-subtle font-bold uppercase mt-1">Informasi kontak untuk bantuan pelanggan</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Email Support"
                                            value={data.contact_email}
                                            onChange={e => setData('contact_email', e.target.value)}
                                            error={errors.contact_email}
                                        />
                                        <Input
                                            label="Nomor Telepon"
                                            value={data.contact_phone}
                                            onChange={e => setData('contact_phone', e.target.value)}
                                            error={errors.contact_phone}
                                        />
                                        <div className="md:col-span-2">
                                            <Textarea
                                                label="Alamat Lengkap"
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                error={errors.address}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end sticky bottom-8 z-10">
                            <Button
                                variant="dark"
                                size="lg"
                                loading={processing}
                                icon={AppIcons.save}
                                className="shadow-lux px-10"
                            >
                                Simpan Semua Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
