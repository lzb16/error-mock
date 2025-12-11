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
      // For testing: bundle everything including React
      // For production: uncomment external to reduce bundle size
      // external: ['react', 'react-dom', '@error-mock/core'],
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
