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
                // ── Grey-Based Dark Identity ──────────────────────────────────
                // Main backgrounds — cool steel grey, bukan hitam
                'store-charcoal':        '#1E2028',   // bg utama
                'store-charcoal-light':  '#252830',   // card / surface
                'store-charcoal-lighter':'#2C2F3C',   // border hover
                'store-charcoal-darker': '#181A21',   // header / footer aksen
                'store-dark':            '#13151C',   // auth pages, sidebar darkest
                // Teks & UI
                'store-body':   '#3D4055',
                'store-muted':  '#6B7194',
                'store-subtle': '#9499B8',
                // Borders
                'store-border':      '#E4E4E7',  // light (untuk admin)
                'store-border-dark': '#2C2F3C',  // dark surfaces
                // ── Accent ───────────────────────────────────────────────────
                'store-accent':      '#FACC15',  // Yellow
                'store-accent-dark': '#EAB308',
                // ── Admin Panel ──────────────────────────────────────────────
                'admin-sidebar':       '#1E2028',
                'admin-sidebar-hover': '#252830',
                'admin-accent':        '#FACC15',
                'admin-surface':       '#FFFFFF',
                'admin-bg':            '#FAFAFA',
                // ── Guest / publik (putih & abu) ───────────────────────────
                'guest-bg':       '#F4F4F5',
                'guest-surface':  '#FFFFFF',
                'guest-elevated': '#FAFAFA',
                'guest-border':   '#E4E4E7',
                'guest-text':     '#18181B',
                'guest-muted':    '#71717A',
                'guest-subtle':   '#A1A1AA',
            },
            fontFamily: {
                sans:  ['Outfit', ...defaultTheme.fontFamily.sans],
                bebas: ['"Bebas Neue"', 'cursive'],
                oswald: ['Oswald', 'sans-serif'],
                mono:  ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            container: {
                center: true,
                padding: { DEFAULT: '1.5rem', lg: '2rem' },
                screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
            },
            borderRadius: {
                'sm':      '0.375rem',
                'DEFAULT': '0.5rem',
                'md':      '0.625rem',
                'lg':      '0.75rem',
                'xl':      '1rem',
                '2xl':     '1.25rem',
                '3xl':     '1.5rem',
                'full':    '9999px',
            },
            boxShadow: {
                'soft':        '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                'lux':         '0 20px 50px -12px rgba(0,0,0,0.18), 0 8px 16px -8px rgba(0,0,0,0.1)',
                'sidebar':     '4px 0 24px -4px rgba(0,0,0,0.12)',
                'card':        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                'accent-glow': '0 0 24px rgba(250,204,21,0.10)',
            },
            letterSpacing: {
                tightest: '-.075em',
                widest:   '.25em',
            },
            transitionTimingFunction: {
                spring: 'cubic-bezier(0.175,0.885,0.32,1.275)',
            },
        },
    },

    plugins: [forms],
};
