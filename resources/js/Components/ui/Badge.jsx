/**
 * Badge — Refined admin badge
 */
export default function Badge({ children, variant = 'gray', className = '' }) {
    const variants = {
        gray: 'bg-gray-100 text-gray-600 border-gray-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        green: 'bg-green-50 text-green-700 border-green-100',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        accent: 'bg-store-accent/10 text-store-accent-dark border-store-accent/20',
        charcoal: 'bg-store-charcoal text-white border-black',
    };

    const base = variants[variant] ?? variants.gray;

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${base} ${className}`}>
            {children}
        </span>
    );
}

/**
 * OrderStatusBadge — Specialized badge for orders
 */
export function OrderStatusBadge({ status, className = '' }) {
    const config = {
        'unpaid': { variant: 'yellow', label: 'Belum Bayar' },
        'paid': { variant: 'indigo', label: 'Dibayar' },
        'success': { variant: 'green', label: 'Berhasil' },
        'failed': { variant: 'red', label: 'Gagal' },
        'expired': { variant: 'gray', label: 'Kadaluwarsa' },
    };

    const { variant, label } = config[status] || { variant: 'gray', label: status };

    return (
        <Badge variant={variant} className={className}>
            {label}
        </Badge>
    );
}
