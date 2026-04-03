import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                // ── Charcoal Gray & Luxury ────────────────────────────────
                'store-charcoal': '#121212',
                'store-charcoal-light': '#1A1A1A',
                'store-charcoal-lighter': '#27272A',
                'store-dark': '#09090B',
                'store-body': '#3F3F46',
                'store-muted': '#71717A',
                'store-subtle': '#A1A1AA',
                'store-border': '#E4E4E7',
                'store-border-dark': '#27272A',
                // ── Accent ────────────────────────────────────────────────
                'store-accent': '#FACC15', // Vibrant Yellow
                'store-accent-dark': '#EAB308',
                // ── Admin Refined ─────────────────────────────────────────
                'admin-sidebar': '#121212',
                'admin-sidebar-hover': '#1A1A1A',
                'admin-accent': '#FACC15',
                'admin-surface': '#FFFFFF',
                'admin-bg': '#FAFAFA',
            },
            fontFamily: {
                sans: ['Outfit', ...defaultTheme.fontFamily.sans],
                bebas: ['"Bebas Neue"', 'cursive'],
                oswald: ['Oswald', 'sans-serif'],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            container: {
                center: true,
                padding: { DEFAULT: '1.5rem', lg: '2rem' },
                screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
            },
            borderRadius: {
                'sm': '0.375rem',
                'DEFAULT': '0.5rem',
                'md': '0.625rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
                'full': '9999px',
            },
            boxShadow: {
                'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                'lux': '0 20px 50px -12px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.04)',
                'sidebar': '4px 0 24px -4px rgba(0, 0, 0, 0.04)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'accent-glow': '0 0 15px rgba(250,204,21,0.15)',
            },
            letterSpacing: {
                tightest: '-.075em',
                widest: '.25em',
            },
            transitionTimingFunction: {
                spring: 'cubic-bezier(0.175,0.885,0.32,1.275)',
            },
        },
    },

    plugins: [forms],
};
