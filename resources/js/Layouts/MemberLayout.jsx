import GuestLayout from '@/Layouts/GuestLayout';
import MemberSubnav from '@/Components/member/MemberSubnav';

export default function MemberLayout({ children, title, subtitle }) {
    return (
        <GuestLayout title={title} subtitle={subtitle} memberArea hidePageHeading>
            <MemberSubnav />
            {(title || subtitle) && (
                <div className="section-container border-b border-guest-border/70 bg-guest-bg/50 pb-4 pt-4 sm:pt-5">
                    {title && <h1 className="section-heading">{title}</h1>}
                    {subtitle && <p className="section-subtext mt-1">{subtitle}</p>}
                </div>
            )}
            {children}
        </GuestLayout>
    );
}
