/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'em-',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  important: '[data-error-mock-ui]',
};
