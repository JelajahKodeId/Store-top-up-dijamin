export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                'checkbox-field ' +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
