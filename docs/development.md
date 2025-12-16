# 开发说明

本仓库是 `pnpm` monorepo，主要包：

- `packages/core`：拦截器与 mock 引擎（fetch/xhr、规则匹配、响应生成、存储）
- `packages/parser`：API 解析（从 `src/api` 生成 `ApiMeta`）
- `packages/ui`：React UI（Shadow DOM 挂载、规则编辑）
- `packages/plugin`：统一插件（Vite / Webpack，开发期注入 runtime）
- `packages/vite-plugin`：兼容包（转发到 `@error-mock/plugin`）
- `packages/webpack-plugin`：兼容包（转发到 `@error-mock/plugin`）

## 本地开发

```bash
pnpm install
pnpm build
pnpm test
```

### 运行示例

- Vite 示例（推荐用于 UI 开发）：

```bash
pnpm dev
```

- Umi3 示例：

```bash
pnpm -C examples/umi3-example dev
```

## Hot Reload

见 `docs/hot-reload-architecture.md`。
