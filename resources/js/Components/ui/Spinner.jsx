/**
 * Spinner — loading indicator
 * @param {'sm'|'md'|'lg'} size
 * @param {'gray'|'white'|'accent'|'indigo'} color
 */
export default function Spinner({ size = 'md', color = 'gray', className = '' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    const colors = {
        gray: 'border-gray-200 border-t-gray-500',
        white: 'border-white/20 border-t-white',
        accent: 'border-yellow-100 border-t-yellow-400',
        indigo: 'border-indigo-100 border-t-indigo-500',
    };
    return (
        <div
            className={`${sizes[size]} ${colors[color]} border-2 rounded-full animate-spin ${className}`}
        />
    );
}
