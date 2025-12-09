/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'em-',
  content: [
    './src/**/*.{svelte,js,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
