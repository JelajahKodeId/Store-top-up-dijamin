export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'t-caption !text-red-600 ' + className}
        >
            {message}
        </p>
    ) : null;
}

<TransitionChild
    enter="ease-out duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
>
    <div className="absolute inset-0 bg-store-dark-surface/80 backdrop-blur-sm" />
</TransitionChild>
