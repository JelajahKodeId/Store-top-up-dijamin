import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * GuestInput — field form halaman publik (tema terang).
 */
const GuestInput = forwardRef(function GuestInput(
    { label, error, icon, solidIcon = false, className = '', containerClassName = '', required, type, rows = 4, ...props },
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
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center transition-colors duration-300 ${solidIcon ? 'w-[3.25rem] bg-store-accent text-guest-bg rounded-l-md border-r border-store-accent/20' : 'w-12 left-0 text-guest-subtle group-focus-within:text-store-accent'}`}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}

                {Icon && isTextarea && (
                    <div className={`pointer-events-none absolute left-0 top-0 bottom-0 flex w-[3.25rem] items-start justify-center pt-3.5 transition-colors duration-300 ${solidIcon ? 'bg-store-accent text-guest-bg rounded-l-md border-r border-store-accent/20' : 'left-0 text-guest-subtle group-focus-within:text-store-accent'}`}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}

                {isTextarea ? (
                    <textarea
                        {...props}
                        ref={ref}
                        rows={rows}
                        required={required}
                        className={`${baseClass} resize-none py-3 pr-4 ${Icon ? (solidIcon ? 'pl-[4.25rem]' : 'pl-12') : 'pl-4'}`}
                    />
                ) : (
                    <input
                        {...props}
                        ref={ref}
                        type={type}
                        required={required}
                        className={`${baseClass} py-3 pr-4 ${Icon ? (solidIcon ? 'pl-[4.25rem]' : 'pl-12') : 'pl-4'}`}
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
