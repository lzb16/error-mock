// {{RIPER-10 Action}}
// Role: LD | Task_ID: N/A | Time: 2025-12-21T19:29:41+08:00
// Principle: SOLID-O (开闭原则)
// Taste: 前缀规则收敛到单一来源（CSS `prefix(em)`），避免文档/配置与实现分叉

/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4 prefix is defined in CSS via `@import "tailwindcss" prefix(em);`.
  // Utilities are used as `em:flex`, `em:hover:bg-...`, etc.
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
