import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * Input component — charcoal lux with centralized icon support
 */
const Input = forwardRef(function Input(
    { label, error, icon, className = '', containerClassName = '', type = 'text', ...props },
    ref
) {
    const Icon = typeof icon === 'string' ? (AppIcons[icon] || AppIcons.info) : icon;

    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-[11px] font-black text-store-muted uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-store-muted group-focus-within:text-store-charcoal transition-colors">
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}

                <input
                    {...props}
                    type={type}
                    ref={ref}
                    className={`
                        w-full bg-white border-1.5 rounded-xl py-3 px-4 text-sm font-bold text-store-charcoal
                        placeholder:text-store-subtle transition-all outline-none shadow-soft
                        ${Icon ? 'pl-12' : ''}
                        ${error
                            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-store-border focus:border-store-charcoal focus:ring-4 focus:ring-store-charcoal/5'
                        }
                        ${className}
                    `.trim()}
                />
            </div>

            {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
});

/**
 * Select component
 */
export const Select = forwardRef(function Select(
    { label, error, icon, children, className = '', containerClassName = '', ...props },
    ref
) {
    // Mempertahankan icon custom (biasanya di sisi kiri) jika dikirim via props
    const Icon = typeof icon === 'string' ? (AppIcons[icon] || AppIcons.info) : icon;

    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-[11px] font-black text-store-muted uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-store-muted group-focus-within:text-store-charcoal transition-colors pointer-events-none">
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}

                <select
                    {...props}
                    ref={ref}
                    className={`
                        w-full bg-white border-1.5 rounded-xl py-3 px-4 text-sm font-bold text-store-charcoal
                        transition-all outline-none shadow-soft
                        ${Icon ? 'pl-12' : ''}
                        ${error
                            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-store-border focus:border-store-charcoal focus:ring-4 focus:ring-store-charcoal/5'
                        }
                        ${className}
                    `.trim()}
                >
                    {children}
                </select>

                {/* Bagian ChevronIcon di sini sudah dihapus */}
            </div>

            {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
});

/**
 * Textarea component
 */
export const Textarea = forwardRef(function Textarea(
    { label, error, className = '', containerClassName = '', ...props },
    ref
) {
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-[11px] font-black text-store-muted uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}

            <textarea
                {...props}
                ref={ref}
                rows={4}
                className={`
                    w-full bg-white border-1.5 rounded-xl py-3 px-4 text-sm font-bold text-store-charcoal
                    placeholder:text-store-subtle transition-all outline-none shadow-soft resize-none
                    ${error
                        ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-store-border focus:border-store-charcoal focus:ring-4 focus:ring-store-charcoal/5'
                    }
                    ${className}
                `.trim()}
            />

            {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
});

export default Input;
