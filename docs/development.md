# 开发说明

本仓库是 `pnpm` monorepo，主要包：

- `packages/core`：拦截器与 mock 引擎（fetch/xhr、规则匹配、响应生成、存储）
- `packages/parser`：API 解析（从 `src/api` 生成 `ApiMeta`）
- `packages/ui`：React UI（Shadow DOM 挂载、规则编辑）
- `packages/vite-plugin`：Vite 插件（开发期注入 runtime）
- `packages/webpack-plugin`：Webpack 插件（开发期写入 runtime entry 并注入）

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
