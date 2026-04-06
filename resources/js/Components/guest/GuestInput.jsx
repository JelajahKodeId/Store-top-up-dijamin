import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * GuestInput — Dark-theme input/textarea field for all public-facing guest forms.
 * When type === 'textarea', renders a <textarea> element instead of <input>.
 *
 * @param {string} label           - Field label (optional)
 * @param {string} error           - Validation error message (optional)
 * @param {string|Component} icon  - AppIcon key string or component (optional)
 * @param {string} className       - Extra classes for the input element
 * @param {boolean} required       - Whether the field is required
 */
const GuestInput = forwardRef(function GuestInput(
    { label, error, icon, className = '', containerClassName = '', required, type, rows = 4, ...props },
    ref
) {
    const Icon = typeof icon === 'string' ? (AppIcons[icon] ?? null) : icon;
    const isTextarea = type === 'textarea';

    const baseClass = `
        w-full bg-white/5 border border-white/5 text-white font-medium
        placeholder:text-white/15 transition-all outline-none
        focus:ring-4 focus:ring-store-accent/10 focus:border-store-accent/30
        ${error ? 'border-red-500/40 focus:ring-red-500/10 focus:border-red-500/40' : ''}
        ${className}
    `.trim();

    return (
        <div className={`space-y-3 ${containerClassName}`}>
            {label && (
                <label className="flex items-center gap-2 ml-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                        {label}
                    </span>
                    {!required && (
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest border border-white/10 rounded px-1.5 py-0.5">
                            Opsional
                        </span>
                    )}
                </label>
            )}

            <div className="relative group">
                {Icon && !isTextarea && (
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors duration-300">
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                )}

                {Icon && isTextarea && (
                    <div className="absolute top-5 left-6 pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors duration-300">
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                )}

                {isTextarea ? (
                    <textarea
                        {...props}
                        ref={ref}
                        rows={rows}
                        required={required}
                        className={`${baseClass} rounded-2xl py-4 pr-6 resize-none ${Icon ? 'pl-16' : 'pl-6'}`}
                    />
                ) : (
                    <input
                        {...props}
                        ref={ref}
                        type={type}
                        required={required}
                        className={`${baseClass} rounded-[2rem] py-5 pr-8 ${Icon ? 'pl-16' : 'pl-6'}`}
                    />
                )}
            </div>

            {error && (
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-2">
                    <AppIcons.help size={12} />
                    {error}
                </p>
            )}
        </div>
    );
});

export default GuestInput;
