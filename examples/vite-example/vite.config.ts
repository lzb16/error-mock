import { defineConfig } from 'vite';
import { resolve } from 'path';
// 从源码导入插件和开发辅助工具
import errorMockPlugin, { errorMockDevWatcher } from '../../packages/plugin/src/index.ts';

const packagesDir = resolve(__dirname, '../../packages');

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
    // Monorepo 开发热更新（仅内部开发使用）
    errorMockDevWatcher({ watch: ['ui'] }),
  ],
  resolve: {
    alias: {
      '@error-mock/ui': resolve(packagesDir, 'ui/dist'),
      '@error-mock/core': resolve(packagesDir, 'core/dist'),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: ['../..'],
    },
  },
  optimizeDeps: {
    exclude: ['@error-mock/core', '@error-mock/ui'],
  },
});
