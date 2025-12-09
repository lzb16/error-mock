import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
  resolve: {
    alias: {
      '@error-mock/core': path.resolve(__dirname, '../../packages/core/src'),
      '@error-mock/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@error-mock/parser': path.resolve(__dirname, '../../packages/parser/src'),
    },
  },
  server: {
    port: 3000,
  },
});
