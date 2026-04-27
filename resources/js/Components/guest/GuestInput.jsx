import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * GuestInput — field form halaman publik (tema terang).
 */
const GuestInput = forwardRef(function GuestInput(
    { label, error, icon, className = '', containerClassName = '', required, type, rows = 4, ...props },
    ref
) {
    const Icon = typeof icon === 'string' ? (AppIcons[icon] ?? null) : icon;
    const isTextarea = type === 'textarea';

    const baseClass = `
        w-full rounded-md border border-guest-border bg-white font-medium text-guest-text shadow-sm
        text-sm placeholder:text-guest-subtle transition-all outline-none
        focus:border-store-accent/50 focus:ring-2 focus:ring-store-accent/15
        ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
        ${className}
    `.trim();

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="ml-1 flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-guest-muted">
                        {label}
                    </span>
                    {!required && (
                        <span className="rounded border border-guest-border bg-guest-elevated px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-guest-subtle">
                            Opsional
                        </span>
                    )}
                </label>
            )}

            <div className="group relative">
                {Icon && !isTextarea && (
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-guest-subtle transition-colors duration-300 group-focus-within:text-store-accent">
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}

                {Icon && isTextarea && (
                    <div className="pointer-events-none absolute left-4 top-4 text-guest-subtle transition-colors duration-300 group-focus-within:text-store-accent">
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}

                {isTextarea ? (
                    <textarea
                        {...props}
                        ref={ref}
                        rows={rows}
                        required={required}
                        className={`${baseClass} resize-none py-3 pr-4 ${Icon ? 'pl-12' : 'pl-4'}`}
                    />
                ) : (
                    <input
                        {...props}
                        ref={ref}
                        type={type}
                        required={required}
                        className={`${baseClass} py-3 pr-4 ${Icon ? 'pl-12' : 'pl-4'}`}
                    />
                )}
            </div>

            {error && (
                <p className="ml-2 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AppIcons.help size={12} />
                    {error}
                </p>
            )}
        </div>
    );
});

export default GuestInput;
