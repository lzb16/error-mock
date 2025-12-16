# Error Mock

一个面向前端开发环境的请求 Mock 工具：在浏览器端拦截 `fetch` / `XMLHttpRequest`，并提供悬浮按钮 + 配置面板来管理 mock 规则（响应与网络模拟）。

## 组件与包

- `@error-mock/plugin`：统一插件（Vite / Webpack，开发环境注入 runtime）
- `@error-mock/ui`：UI（React + Shadow DOM，内置规则编辑与持久化）
- `@error-mock/core`：拦截器与 mock 引擎
- `@error-mock/parser`：从 `src/api` 生成 `ApiMeta`（供 UI 展示）

> 兼容包：`@error-mock/vite-plugin` / `@error-mock/webpack-plugin` 仍保留，但内部已收敛到 `@error-mock/plugin`，推荐直接使用统一包。

## 安装

### Vite

```bash
npm i -D @error-mock/plugin
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/plugin';

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
npm i -D @error-mock/plugin
```

```ts
// .umirc.ts
import { defineConfig } from 'umi';
import { ErrorMockWebpackPlugin } from '@error-mock/plugin';

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

## API 定义（用于自动生成列表）

默认解析器扫描 `src/api/<module>/index.ts`，识别顶层的 `createRequest<Res, Req>({ url, method })`。

```ts
// src/api/user/index.ts
export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
  method: 'GET',
});
```

更多支持/限制见 `docs/api-parsing.md`。

## 使用方式

1. 启动开发服务器
2. 点击页面右下角蓝色魔杖按钮打开面板
3. 选择 API → 配置 Response / Network → 点 `Apply` 生效
4. 点 `Cancel` 放弃当前草稿并回滚

## 文档

- 快速开始：`docs/getting-started.md`
- API 解析规则：`docs/api-parsing.md`
- 常见问题：`docs/troubleshooting.md`
- 路线图：`docs/roadmap.md`
- 开发说明：`docs/development.md`
- 发布到 npm：`docs/publishing.md`

## 示例项目

- `examples/vite-example`
- `examples/umi3-example`

仓库内运行：

```bash
pnpm install
pnpm dev
```

## 路线图

见 `docs/roadmap.md`（包含：字段缺失 UI、按 TS 类型生成 mock 模板、解析能力增强、批量编辑等）。

## License

MIT
