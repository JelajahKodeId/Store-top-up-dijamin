import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

/**
 * Alert — Refined admin callouts
 */
export default function Alert({
    type = 'info',
    title,
    children,
    className = ''
}) {
    const config = {
        info: {
            bg: 'bg-blue-50/50',
            border: 'border-blue-100',
            text: 'text-blue-700',
            icon: Info,
            iconBg: 'bg-blue-100'
        },
        success: {
            bg: 'bg-green-50/50',
            border: 'border-green-100',
            text: 'text-green-700',
            icon: CheckCircle2,
            iconBg: 'bg-green-100'
        },
        warning: {
            bg: 'bg-yellow-50/50',
            border: 'border-yellow-100',
            text: 'text-yellow-700',
            icon: AlertCircle,
            iconBg: 'bg-yellow-100'
        },
        danger: {
            bg: 'bg-red-50/50',
            border: 'border-red-100',
            text: 'text-red-700',
            icon: XCircle,
            iconBg: 'bg-red-100'
        }
    };

    const style = config[type] || config.info;
    const Icon = style.icon;

    return (
        <div className={`p-5 rounded-2xl border ${style.bg} ${style.border} flex gap-4 ${className}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.text}`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                {title && (
                    <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${style.text}`}>
                        {title}
                    </h4>
                )}
                <div className={`text-sm font-medium leading-relaxed opacity-90 ${style.text}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
