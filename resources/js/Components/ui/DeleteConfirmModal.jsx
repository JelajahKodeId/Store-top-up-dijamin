import Modal from '@/Components/ui/Modal';
import Button from '@/Components/ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
    show,
    onClose,
    onConfirm,
    title = 'Konfirmasi Hapus',
    message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
    processing = false
}) {
    return (
        <Modal
            show={show}
            onClose={onClose}
            maxWidth="md"
            title={title}
            footer={
                <div className="flex gap-3 w-full font-sans">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1"
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="dark"
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-red-500/20"
                        loading={processing}
                    >
                        Ya, Hapus
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
                    <Trash2 size={32} strokeWidth={2.5} />
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-medium text-store-muted leading-relaxed font-sans">
                        {message}
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 text-left">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight font-sans">
                            Peringatan: Data yang dihapus mungkin memiliki keterkaitan dengan data lainnya.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
