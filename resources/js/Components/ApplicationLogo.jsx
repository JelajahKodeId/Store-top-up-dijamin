export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/images/logo.jpeg"
            alt="Mall Store Logo"
            className={`${props.className} rounded-lg`}
        />
    );
}
