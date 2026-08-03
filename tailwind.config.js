
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-blue-100', 'text-blue-600',
    'bg-amber-100', 'text-amber-600',
    'bg-green-100', 'text-green-600',
    'bg-purple-100', 'text-purple-600',
  ],
};
