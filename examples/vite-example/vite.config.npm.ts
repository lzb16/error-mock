import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/plugin';

// Consumer config: simulate installing from npm (no monorepo alias/source import).
export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
});

