/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'zerotrace-dark': '#0f172a',
                'zerotrace-accent': '#38bdf8',
                'zerotrace-glass': 'rgba(255, 255, 255, 0.1)',
            }
        },
    },
    plugins: [],
}
