/**
 * Card — container atom with refined charcoal lux variations
 * @param {'default'|'flat'|'ghost'|'lux'|'dark'} variant
 */
export default function Card({ children, variant = 'default', className = '', ...props }) {
    const variants = {
        default: 'store-card',
        lux: 'admin-content-card shadow-lux',
        flat: 'bg-store-surface-2 rounded-2xl border border-store-border',
        ghost: 'rounded-2xl',
        dark: 'store-card-dark',
    };

    const base = variants[variant] ?? variants.default;

    return (
        <div className={`${base} ${className}`} {...props}>
            {children}
        </div>
    );
}

Card.Header = function CardHeader({ children, className = '', border = true }) {
    return (
        <div className={`px-8 py-6 ${border ? 'border-b border-store-border' : ''} ${className}`}>
            {children}
        </div>
    );
};

Card.Body = function CardBody({ children, className = '' }) {
    return <div className={`px-8 py-6 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '', bg = true }) {
    return (
        <div className={`px-8 py-6 border-t border-store-border ${bg ? 'bg-gray-50/50' : 'bg-transparent'} rounded-b-2xl ${className}`}>
            {children}
        </div>
    );
};
