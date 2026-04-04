import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * GuestInput — Dark-theme input field for all public-facing guest forms.
 * Consistent dark styling: bg-white/5, border-white/5, rounded-[2rem].
 *
 * @param {string} label        - Field label (optional)
 * @param {string} error        - Validation error message (optional)
 * @param {string|Component} icon - AppIcon key string or component (optional)
 * @param {string} className    - Extra classes for the input element
 */
const GuestInput = forwardRef(function GuestInput(
    { label, error, icon, className = '', containerClassName = '', ...props },
    ref
) {
    const Icon = typeof icon === 'string' ? (AppIcons[icon] ?? null) : icon;

    return (
        <div className={`space-y-3 ${containerClassName}`}>
            {label && (
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors duration-300">
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                )}

                <input
                    {...props}
                    ref={ref}
                    className={`
                        w-full bg-white/5 border border-white/5 text-white font-medium
                        placeholder:text-white/15 transition-all outline-none
                        rounded-[2rem] py-5 pr-8 
                        focus:ring-4 focus:ring-store-accent/10 focus:border-store-accent/30
                        ${Icon ? 'pl-16' : 'pl-6'}
                        ${error ? 'border-red-500/40 focus:ring-red-500/10 focus:border-red-500/40' : ''}
                        ${className}
                    `.trim()}
                />
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
