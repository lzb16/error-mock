import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/vite-plugin';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
  server: {
    port: 3000,
  },
});
