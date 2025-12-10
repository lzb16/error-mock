import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { preprocessMeltUI } from '@melt-ui/pp';

export default defineConfig({
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      preprocess: [sveltePreprocess(), preprocessMeltUI()],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'packages/core/src/**/*.ts',
        'packages/parser/src/**/*.ts',
        'packages/ui/src/**/*.ts',
        'packages/ui/src/**/*.svelte',
      ],
      exclude: [
        '**/*.d.ts',
        '**/types.ts',
        '**/index.ts',
        '**/__tests__/**',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
