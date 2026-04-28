import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import GuestLayout from './Layouts/GuestLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Stable reference untuk persistent layout
const guestLayout = (page) => <GuestLayout children={page} />;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx'))
        .then((module) => {
            if (name.startsWith('Guest/') && module.default.layout === undefined) {
                module.default.layout = guestLayout;
            }
            return module;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#FFCC00',
    },
});
