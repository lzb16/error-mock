# 快速开始

`error-mock` 是一个面向前端开发环境的请求拦截与可视化 Mock 工具：

- 在浏览器端拦截 `fetch` / `XMLHttpRequest`
- 通过悬浮按钮打开配置面板，为每个 API 配置响应与网络模拟规则
- 规则与全局配置持久化在 `localStorage`

> 生产环境默认不注入、不生效（Vite/webpack 插件都会在生产构建时直接跳过）。

## 安装

### Vite

```bash
npm i -D @error-mock/vite-plugin
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/vite-plugin';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
});
```

### Webpack / Umi3

```bash
npm i -D @error-mock/webpack-plugin
```

```ts
// .umirc.ts
import { defineConfig } from 'umi';
import { ErrorMockWebpackPlugin } from '@error-mock/webpack-plugin';

export default defineConfig({
  chainWebpack(config) {
    config.plugin('error-mock').use(ErrorMockWebpackPlugin, [
      {
        apiDir: 'src/api',
      },
    ]);
  },
});
```

> webpack 插件会在开发环境生成一段运行时代码并注入到 entry，默认写入 `node_modules/.cache/error-mock`（可通过 `runtimeDir` 自定义）。

> `@error-mock/ui` 会作为插件依赖自动安装；业务代码无需手动引入或 mount。

## API 目录约定（自动解析）

默认解析器只扫描：

```
src/api/<module>/index.ts
```

并识别顶层的 `createRequest<Res, Req>({ url, method })` 形式。示例：

```ts
// src/api/user/index.ts
export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
  method: 'GET',
});
```

更多细节与限制见 `docs/api-parsing.md`。

## 使用方式

1. 启动开发服务器（Vite / Umi dev）
2. 页面右下角会出现蓝色魔杖按钮，点击打开面板
3. 左侧选择 API
4. 右侧配置：
   - Response：HTTP 状态码、业务字段（`errNo/errMsg/detailErrMsg`）、`result` 或 `errorBody` JSON
   - Network：延迟/随机失败/断网/超时，以及全局网络 profile
5. 点 `Apply` 生效；点 `Cancel` 放弃当前草稿，回滚到已应用的规则

## 示例项目

- Vite 示例：`examples/vite-example`
- Umi3 示例：`examples/umi3-example`

在仓库根目录运行：

```bash
pnpm install
pnpm dev
```

或单独启动 Umi3 示例：

```bash
pnpm -C examples/umi3-example dev
```
