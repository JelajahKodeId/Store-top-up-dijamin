import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

const variants = {
    primary: 'bg-store-accent text-store-dark hover:bg-store-accent/90 shadow-accent-glow',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-sm',
    dark: 'bg-store-charcoal text-white hover:bg-black border border-white/5 shadow-lux',
    ghost: 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10',
    outline: 'bg-transparent border border-white/20 text-white hover:border-store-accent hover:text-store-accent transition-all'
};

const sizes = {
    // Sizing lebih presisi dan proporsional
    sm: 'px-4 py-2 text-[9px] sm:text-[10px] tracking-wider min-h-[36px]',
    md: 'px-5 py-2.5 text-[10px] sm:text-[11px] tracking-widest min-h-[44px]',
    lg: 'px-8 py-3.5 text-xs tracking-[0.15em] min-h-[52px]',
};

/**
 * Button — Refined charcoal lux button
 */
const Button = forwardRef(function Button(
    {
        children,
        variant = 'primary',
        size = 'md',
        className = '',
        as: Tag = 'button',
        loading = false,
        disabled = false,
        icon,
        iconPosition = 'left',
        ...props
    },
    ref
) {
    const baseVariant = variants[variant] ?? variants.primary;
    const baseSize = sizes[size] ?? sizes.md;
    const isDisabled = disabled || loading;

    const LoaderIcon = AppIcons.loading;
    
    // Tentukan ukuran ikon berdasarkan size button
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    const getIcon = (iconName) => {
        if (!iconName) return null;
        if (typeof iconName === 'string') {
            return AppIcons[iconName] || AppIcons.info;
        }
        return iconName;
    };

    const Icon = getIcon(icon);

    return (
        <Tag
            ref={ref}
            disabled={isDisabled}
            className={`
                /* Layout Dasar */
                inline-flex items-center justify-center gap-2.5 
                /* Tipografi: Diubah dari font-black ke font-bold */
                font-bold uppercase text-center
                /* Animasi & State */
                transition-all duration-300 active:scale-[0.97]
                rounded-xl cursor-pointer select-none
                disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100
                /* Dynamic Classes */
                ${baseVariant} ${baseSize} ${className}
            `.trim()}
            {...props}
        >
            {loading ? (
                <LoaderIcon className="w-4 h-4 animate-spin shrink-0" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && (
                        <Icon size={iconSize} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:scale-110" />
                    )}
                    
                    <span className="truncate">{children}</span>

                    {Icon && iconPosition === 'right' && (
                        <Icon size={iconSize} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:scale-110" />
                    )}
                </>
            )}
        </Tag>
    );
});

export default Button;