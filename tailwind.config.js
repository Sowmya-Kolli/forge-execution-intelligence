/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#09090b',
                foreground: '#f4f4f5',
                card: {
                    DEFAULT: '#18181b',
                    foreground: '#fafafa',
                },
                primary: {
                    DEFAULT: '#f4f4f5',
                    foreground: '#18181b',
                },
                muted: {
                    DEFAULT: '#27272a',
                    foreground: '#a1a1aa',
                },
                accent: {
                    DEFAULT: '#27272a',
                    foreground: '#fafafa',
                },
                border: '#27272a',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};
