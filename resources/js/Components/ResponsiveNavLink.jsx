import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${active
                    ? 'border-accent bg-accent/10 text-accent focus:border-yellow-400 focus:bg-accent/20 focus:text-yellow-400'
                    : 'border-transparent text-gray-400 hover:border-primary-700 hover:bg-primary-800 hover:text-gray-200 focus:border-primary-700 focus:bg-primary-800 focus:text-gray-200'
                } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
