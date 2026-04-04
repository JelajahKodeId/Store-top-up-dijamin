import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

/**
 * Modal — Accessible lux modal using Headless UI
 */
export default function Modal({
    show = false,
    onClose = () => { },
    title,
    children,
    maxWidth = 'lg',
    closeable = true,
    footer,
    headerExtra,
    padding = true,
    onSubmit
}) {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
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
                className="fixed inset-0 flex overflow-y-auto px-4 py-8 sm:px-0 items-center justify-center z-[100] transform transition-all"
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
                        as={onSubmit ? 'form' : 'div'}
                        onSubmit={onSubmit}
                        className={`w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-lux border border-white transform transition-all sm:mx-auto flex flex-col ${maxWidthClass}`}
                    >
                        {/* Header */}
                        {(title || closeable) && (
                            <div className="flex-none border-b border-store-border bg-white z-10 font-sans">
                                <div className="px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
                                    <Dialog.Title className="text-base sm:text-lg font-black text-store-charcoal uppercase tracking-tight font-sans">
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
                                {headerExtra && (
                                    <div className="w-full">
                                        {headerExtra}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide flex flex-col">
                            <div className={padding ? 'p-6 sm:p-8' : ''}>
                                {children}
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        {footer && (
                            <div className="flex-none border-t border-store-border bg-admin-bg/50 px-6 sm:px-8 py-5 sm:py-6 z-10 font-sans">
                                {footer}
                            </div>
                        )}
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
