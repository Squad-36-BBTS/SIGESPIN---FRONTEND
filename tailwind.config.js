/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bb: {
          blue: '#005EEF',
          'blue-dark': '#0047B8',
          'blue-active': '#003A99',
          'blue-light': '#EBF2FF',
          yellow: '#FCFC30',
          'yellow-dark': '#E2E210',
          navy: '#002875',
          bg: '#F4F7FC',
          slate: '#1E293B',
          muted: '#64748B',
          line: '#E2E8F0',
          'line-2': '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Calibri', 'Carlito', 'Candara', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        panel: '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        hover: '0 4px 6px -1px rgba(15, 23, 42, 0.08)',
        float: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
