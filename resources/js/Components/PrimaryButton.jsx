export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                'btn-primary ' +
                (disabled ? 'opacity-25' : '') +
                ' ' + className
            }
        >
            {children}
        </button>
    );
}
