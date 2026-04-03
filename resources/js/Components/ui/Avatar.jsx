/**
 * Avatar — initial letter avatar atom
 * @param {string} name   — nama untuk initial
 * @param {string} src    — optional image URL
 * @param {'sm'|'md'|'lg'|'xl'} size
 */
export default function Avatar({ name = '', src, size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    };

    const initial = name.charAt(0).toUpperCase() || '?';

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizes[size] ?? sizes.md} rounded-xl object-cover ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizes[size] ?? sizes.md} rounded-xl bg-store-dark text-store-accent flex items-center justify-center font-black flex-shrink-0 ${className}`}
        >
            {initial}
        </div>
    );
}
