/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0a0b0f',
          secondary: '#111318',
          tertiary: '#181b22',
          elevated: '#1c2028',
        },
        border: {
          DEFAULT: '#23262f',
          hover: '#2e323d',
        },
        text: {
          primary: '#f0f2f5',
          secondary: '#a1a6b0',
          tertiary: '#6b7280',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          soft: 'rgba(59, 130, 246, 0.12)',
        },
      },
    },
  },
  plugins: [],
};
