import { defineConfig } from 'umi';
import { ErrorMockWebpackPlugin } from '@error-mock/webpack-plugin';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  chainWebpack(config: any) {
    config.plugin('error-mock').use(ErrorMockWebpackPlugin, [
      {
        apiDir: 'src/api',
      },
    ]);
  },
});
