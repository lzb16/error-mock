import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ['src/react/**/*'],
      outDir: 'dist/react',
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/react'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/react/index.ts'),
      name: 'ErrorMockUIReact',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    outDir: 'dist/react',
    rollupOptions: {
      // React/ReactDOM are bundled (not externalized) by design:
      // - Plugin must be self-contained and work in any environment
      // - Host application may not have React installed
      // - Host React version may be incompatible (e.g., React 17 vs 18)
      // - Prevents "multiple React instances" runtime errors
      // Only @error-mock/core is externalized to avoid duplication
      external: ['@error-mock/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    emptyOutDir: false,
  },
});
