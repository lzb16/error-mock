import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        customElement: false,
      },
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ErrorMockUI',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['@error-mock/core'],
      output: {
        globals: {
          '@error-mock/core': 'ErrorMockCore',
        },
      },
    },
  },
});
