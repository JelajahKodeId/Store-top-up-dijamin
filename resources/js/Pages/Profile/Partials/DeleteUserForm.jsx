import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Modal from '@/Components/Modal';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-bold text-red-600">
                    Hapus Akun
                </h2>

                <p className="mt-1 text-sm text-store-muted leading-relaxed">
                    Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Sebelum menghapus akun, silakan unduh data atau informasi apa pun yang ingin Anda simpan.
                </p>
            </header>

            <Button variant="danger" onClick={confirmUserDeletion}>
                Hapus Akun Saya
            </Button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-8 sm:p-10">
                    <h2 className="text-lg font-black text-store-dark mb-2">
                        Apakah Anda yakin ingin menghapus akun?
                    </h2>

                    <p className="text-sm text-store-muted mb-8 leading-relaxed">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun secara permanen.
                    </p>

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Masukkan Kata Sandi Anda"
                        autoFocus
                        error={errors.password}
                        wrapperClass="mb-8"
                    />

                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={closeModal} type="button">
                            Batal
                        </Button>

                        <Button variant="danger" disabled={processing} type="submit">
                            Ya, Hapus Permanen
                        </Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
