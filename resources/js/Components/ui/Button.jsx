import { forwardRef } from 'react';
import { AppIcons } from '@/Components/shared/AppIcon';

const variants = {
    primary: 'bg-store-accent text-store-charcoal hover:bg-store-accent-dark shadow-accent-glow',
    secondary: 'bg-admin-bg text-store-charcoal hover:bg-store-border border border-store-border shadow-sm',
    dark: 'bg-store-charcoal text-white hover:bg-black shadow-lux',
    ghost: 'bg-transparent text-store-muted hover:bg-admin-bg hover:text-store-charcoal',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
    outline: 'bg-transparent border-1.5 border-store-border text-store-charcoal hover:border-store-charcoal transition-all'
};

const sizes = {
    sm: 'px-4 py-2 text-[10px] tracking-widest',
    md: 'px-6 py-3 text-xs tracking-wider',
    lg: 'px-8 py-4 text-sm tracking-widest',
};

/**
 * Button — Refined charcoal lux button with central icon support
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
    const getIcon = (iconName) => {
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
                inline-flex items-center justify-center gap-2.5 font-black uppercase transition-all duration-200 active:scale-95
                rounded-xl disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
                ${baseVariant} ${baseSize} ${className}
            `.trim()}
            {...props}
        >
            {loading && <LoaderIcon className="w-4 h-4 animate-spin shrink-0" />}

            {!loading && Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={2.5} className="shrink-0" />}

            <span>{children}</span>

            {!loading && Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={2.5} className="shrink-0" />}
        </Tag>
    );
});

export default Button;
