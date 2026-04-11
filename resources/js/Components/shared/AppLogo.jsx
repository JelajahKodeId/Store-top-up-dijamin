import { Link, usePage } from '@inertiajs/react';

/**
 * AppLogo — brand logo shared component.
 * Reads site_name and logo_web from Inertia shared `site` prop automatically.
 *
 * @param {'light'|'dark'} theme
 * @param {'sm'|'md'|'lg'} size
 * @param {string} imageWrapperClassName — kelas tambahan untuk bingkai logo (mis. di footer gelap)
 */
export default function AppLogo({ theme = 'dark', size = 'md', href = '/', className = '', imageWrapperClassName = '' }) {
    const { site } = usePage().props;

    const siteName = site?.name || 'Mall Store';
    const logoUrl  = site?.logo || null;

    const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
    const iconSizes = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-10 h-10' };
    const imgSizes  = { sm: 'h-7', md: 'h-8', lg: 'h-10' };

    const textColor = theme === 'light' ? 'text-white' : 'text-store-dark';
    const subColor  = 'text-store-accent';

    const nameParts = siteName.split(' ');
    const firstName = nameParts[0];
    const restName  = nameParts.slice(1).join(' ');

    const circleFrame = 'rounded-full overflow-hidden ring-2 shadow-sm';
    const circleRing = theme === 'light'
        ? 'ring-white/15'
        : 'ring-guest-border/80';

    return (
        <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
            {logoUrl ? (
                <span className={`inline-flex flex-shrink-0 items-center justify-center ${theme === 'light' ? 'bg-zinc-800' : 'bg-guest-elevated'} ${circleFrame} ${circleRing} ${iconSizes[size]} ${imageWrapperClassName}`.trim()}>
                    <img
                        src={logoUrl}
                        alt={siteName}
                        className="h-full w-full object-cover"
                    />
                </span>
            ) : (
                <div className={`${iconSizes[size]} ${theme === 'light' ? 'bg-zinc-800' : 'bg-store-dark'} ${circleFrame} ${circleRing} flex items-center justify-center flex-shrink-0 group-hover:bg-admin-accent transition-colors duration-200 ${imageWrapperClassName}`.trim()}>
                    <svg className="h-4 w-4 text-store-accent transition-colors group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            <div>
                <span className={`font-black ${textSizes[size]} ${textColor} tracking-tight leading-none`}>
                    {firstName}
                    {restName && <> <span className={subColor}>{restName}</span></>}
                </span>
            </div>
        </Link>
    );
}
