import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${active
                    ? 'border-store-accent bg-store-accent/10 text-store-dark'
                    : 'border-transparent text-store-gray-soft hover:border-store-gray-light hover:bg-store-bg hover:text-store-dark'
                } text-base font-bold transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
