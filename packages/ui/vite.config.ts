import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
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
    // 构建完成标记插件
    {
      name: 'build-complete-marker',
      writeBundle() {
        // 构建完成后写入标记文件
        const markerPath = resolve(__dirname, 'dist/.build-complete');
        writeFileSync(markerPath, Date.now().toString());
      },
    },
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
    emptyOutDir: false, // 避免删除-重建窗口
  },
});
