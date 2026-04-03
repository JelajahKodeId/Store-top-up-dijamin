import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * Modal — Accessible lux modal using Headless UI
 */
export default function Modal({
    show,
    onClose,
    title,
    children,
    maxWidth = 'lg',
    closeable = true
}) {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 flex overflow-y-auto px-4 py-6 sm:px-0 items-center z-[100] transform transition-all"
                onClose={close}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-store-dark/60 backdrop-blur-sm" />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel
                        className={`mb-6 bg-white rounded-3xl overflow-hidden shadow-lux border border-white transform transition-all sm:w-full sm:mx-auto ${maxWidthClass}`}
                    >
                        {/* Header */}
                        {(title || closeable) && (
                            <div className="px-8 py-6 border-b border-store-border flex items-center justify-between">
                                <Dialog.Title className="text-lg font-black text-store-charcoal uppercase tracking-tight">
                                    {title}
                                </Dialog.Title>
                                {closeable && (
                                    <button
                                        onClick={close}
                                        className="p-2 rounded-xl hover:bg-admin-bg text-store-muted hover:text-store-charcoal transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="p-8">
                            {children}
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
