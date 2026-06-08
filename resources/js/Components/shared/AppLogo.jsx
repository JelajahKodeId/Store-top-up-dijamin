import { Link, usePage } from '@inertiajs/react';

/**
 * AppLogo — brand logo shared component.
 * Reads site_name and logo_web from Inertia shared `site` prop automatically.
 *
 * @param {'light'|'dark'} theme
 * @param {'sm'|'md'|'lg'} size
 * @param {string} imageWrapperClassName — kelas tambahan untuk bingkai logo (mis. di footer gelap)
 */
export default function AppLogo({
    href = '/',
    className = '',
    imageWrapperClassName = '',
    size = 'md',
    theme = 'dark',
    subtitle = null,
    subtitleClassName = '',
}) {
    const { site } = usePage().props;

    const siteName = site?.name || 'Mall Store';
    const logoUrl = site?.logo || null;

    const textSizes = { sm: 'text-sm sm:text-base', md: 'text-base sm:text-lg', lg: 'text-xl sm:text-2xl' };
    const iconSizes = { sm: 'w-6 h-6 sm:w-7 sm:h-7', md: 'w-7 h-7 sm:w-8 sm:h-8', lg: 'w-8 h-8 sm:w-10 sm:h-10' };
    const subtitleSizes = { sm: 'text-[5px] sm:text-[6px]', md: 'text-[6px] sm:text-[7px]', lg: 'text-[6.67px] sm:text-[8px]' };

    const textColor = theme === 'light' ? 'text-white' : 'text-store-dark';
    const subColor = 'text-store-accent';

    const nameParts = siteName.split(' ');
    const firstName = nameParts[0];
    const restName = nameParts.slice(1).join(' ');

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

            <div className="flex flex-col justify-center">
                <span className={`font-sans font-black ${textSizes[size]} ${textColor} uppercase tracking-wider leading-none`}>
                    {firstName}
                    {restName && <> <span className={subColor}>{restName}</span></>}
                </span>
                {subtitle && (
                    <div className="mt-0.5 sm:-mt-1 flex flex-col">
                        <div className={`h-[1px] w-full ${theme === 'light' ? 'bg-white/20' : 'bg-guest-border'}`} />
                        <span className={`${subtitleSizes[size]} font-bold uppercase tracking-tight text-center leading-none mt-[2px] sm:mt-[3px] ${subtitleClassName || (theme === 'light' ? 'text-zinc-400' : 'text-guest-subtle')}`}>
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}
