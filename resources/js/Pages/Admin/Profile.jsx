import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { Transition } from '@headlessui/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Avatar from '@/Components/ui/Avatar';
import { AppIcons } from '@/Components/shared/AppIcon';

// ── Update Profile Info ──────────────────────────────────────────────────────
function UpdateProfileForm({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.profile.update'));
    };

    return (
        <div className="bg-white rounded-3xl border border-store-border shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-5 pb-6 border-b border-store-border">
                <div className="p-0.5 rounded-full border-2 border-store-accent">
                    <Avatar name={user.name} size="lg" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-store-charcoal tracking-tight uppercase">{user.name}</h2>
                    <p className="text-[10px] font-bold text-store-subtle uppercase tracking-widest mt-0.5">{user.email}</p>
                    <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-store-accent/10 text-store-accent-dark text-[9px] font-black uppercase tracking-widest border border-store-accent/20">
                        Super Administrator
                    </span>
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest mb-5">
                    Informasi Profil
                </h3>
                <form onSubmit={submit} className="space-y-5">
                    <Input
                        label="Nama Lengkap"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                        error={errors.name}
                    />
                    <Input
                        label="Alamat Email"
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        error={errors.email}
                    />

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-sm text-yellow-800">
                                Email belum terverifikasi.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="font-bold underline hover:text-yellow-900 transition-colors"
                                >
                                    Kirim ulang verifikasi.
                                </Link>
                            </p>
                            {status === 'verification-link-sent' && (
                                <p className="mt-2 text-sm font-bold text-green-600">
                                    Link verifikasi baru telah dikirim.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                        <Button variant="dark" disabled={processing} type="submit">
                            Simpan Perubahan
                        </Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                                <AppIcons.success size={16} /> Berhasil disimpan.
                            </p>
                        </Transition>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Update Password ──────────────────────────────────────────────────────────
function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <div className="bg-white rounded-3xl border border-store-border shadow-sm p-8 space-y-6">
            <h3 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest pb-5 border-b border-store-border">
                Perbarui Kata Sandi
            </h3>
            <p className="text-xs font-medium text-store-subtle -mt-2">
                Pastikan akun Anda menggunakan kata sandi yang kuat dan acak.
            </p>
            <form onSubmit={updatePassword} className="space-y-5">
                <Input
                    label="Kata Sandi Saat Ini"
                    id="current_password"
                    ref={currentPasswordInput}
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    error={errors.current_password}
                />
                <Input
                    label="Kata Sandi Baru"
                    id="password"
                    ref={passwordInput}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    error={errors.password}
                />
                <Input
                    label="Konfirmasi Kata Sandi Baru"
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    error={errors.password_confirmation}
                />
                <div className="flex items-center gap-4 pt-2">
                    <Button variant="dark" disabled={processing} type="submit">
                        Update Sandi
                    </Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                            <AppIcons.success size={16} /> Berhasil diperbarui.
                        </p>
                    </Transition>
                </div>
            </form>
        </div>
    );
}

// ── Security Notice ──────────────────────────────────────────────────────────
function SecurityNotice() {
    return (
        <div className="bg-white rounded-3xl border border-store-border shadow-sm p-6">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <AppIcons.shield size={20} className="text-amber-500" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-store-charcoal uppercase tracking-tight">Keamanan Akun Admin</h4>
                    <p className="text-xs font-medium text-store-subtle mt-1 leading-relaxed">
                        Akun Super Administrator <span className="font-bold text-store-charcoal">tidak dapat dihapus</span> melalui panel ini
                        untuk menjaga keamanan sistem. Hubungi developer jika diperlukan perubahan lebih lanjut.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProfile({ mustVerifyEmail, status }) {
    return (
        <AdminLayout title="Profil Admin" subtitle="Kelola informasi akun dan keamanan">
            <Head title="Profil Admin" />

            <div className="max-w-2xl space-y-6">
                <UpdateProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
                <UpdatePasswordForm />
                <SecurityNotice />
            </div>
        </AdminLayout>
    );
}
