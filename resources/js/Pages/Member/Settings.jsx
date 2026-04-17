import { Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Transition } from '@headlessui/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function Settings({ profile }) {
    const pwdRef = useRef();
    const curPwdRef = useRef();

    const profileForm = useForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch(route('member.settings.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: () => {
                if (passwordForm.errors.password) pwdRef.current?.focus();
                if (passwordForm.errors.current_password) curPwdRef.current?.focus();
            },
        });
    };

    return (
        <MemberLayout title="Pengaturan Akun" subtitle="Perbarui nama, email, dan kata sandi Anda.">
            <section className="section-container mx-auto max-w-xl space-y-8 pb-16">
                <div className="rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-sm">
                    <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-guest-subtle">Profil</h2>
                    <form onSubmit={submitProfile} className="space-y-4">
                        <Input
                            label="Nama Depan"
                            value={profileForm.data.first_name}
                            onChange={(e) => profileForm.setData('first_name', e.target.value)}
                            error={profileForm.errors.first_name}
                            required
                        />
                        <Input
                            label="Nama Belakang"
                            value={profileForm.data.last_name}
                            onChange={(e) => profileForm.setData('last_name', e.target.value)}
                            error={profileForm.errors.last_name}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={profileForm.data.email}
                            onChange={(e) => profileForm.setData('email', e.target.value)}
                            error={profileForm.errors.email}
                            required
                        />
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-guest-muted">No. Whatsapp</label>
                            <input
                                type="text"
                                readOnly
                                disabled
                                value={profile.phone_number || ''}
                                className="w-full cursor-not-allowed rounded-xl border border-guest-border bg-guest-elevated px-3 py-2.5 text-sm text-guest-muted"
                            />
                            <p className="mt-1 text-[11px] text-guest-subtle">No. Whatsapp tidak dapat diedit.</p>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <Button type="submit" variant="dark" disabled={profileForm.processing}>
                                Simpan Profil
                            </Button>
                            <Transition
                                show={profileForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <span className="flex items-center gap-1 text-xs font-bold text-green-700">
                                    <AppIcons.success size={14} /> Tersimpan
                                </span>
                            </Transition>
                        </div>
                    </form>
                </div>

                <div className="rounded-2xl border border-guest-border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-guest-subtle">Ganti Password</h2>
                    <form onSubmit={submitPassword} className="space-y-4">
                        <Input
                            label="Password Saat Ini"
                            type="password"
                            ref={curPwdRef}
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            error={passwordForm.errors.current_password}
                            autoComplete="current-password"
                        />
                        <Input
                            label="Password Baru"
                            type="password"
                            ref={pwdRef}
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                            error={passwordForm.errors.password}
                            autoComplete="new-password"
                        />
                        <Input
                            label="Ulangi Password Baru"
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            error={passwordForm.errors.password_confirmation}
                            autoComplete="new-password"
                        />
                        <div className="flex items-center gap-4 pt-2">
                            <Button type="submit" variant="secondary" disabled={passwordForm.processing}>
                                Perbarui Password
                            </Button>
                            <Transition
                                show={passwordForm.recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <span className="text-xs font-bold text-green-700">Password diperbarui.</span>
                            </Transition>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-guest-muted">
                    <Link href="/" className="font-semibold text-store-accent-dark hover:underline">
                        ← Kembali ke beranda
                    </Link>
                </p>
            </section>
        </MemberLayout>
    );
}
