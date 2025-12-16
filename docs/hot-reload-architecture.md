# 热更新开发架构

本仓库是 `pnpm` monorepo。为了让示例工程尽量贴近真实用户（消费发布产物而非源码），示例默认从各包的 `dist/` 读取代码。

因此在 UI 开发时，我们采用“构建完成 → 写入 marker → 触发整页刷新”的方式，避免构建过程中 `dist/` 半写入导致页面报错。

## 工作流

```
修改 packages/ui/src/react/**
  ↓
packages/ui: vite build --watch
  ↓
输出 dist/react/** 并写入 dist/.build-complete
  ↓
examples/vite-example: errorMockDevWatcher 监听 .build-complete
  ↓
触发 Vite full-reload
```

## 关键实现

- UI 包写 marker：`packages/ui/vite.config.ts`
- watcher 插件：`packages/plugin/src/vite.ts`（`errorMockDevWatcher()`）
- 示例工程启用：`examples/vite-example/vite.config.ts`

## 使用方式

```bash
pnpm dev
```

等价于并行运行：

- `packages/ui`: `pnpm -C packages/ui dev`
- `examples/vite-example`: `pnpm -C examples/vite-example dev`

## 监听多个包

`errorMockDevWatcher` 支持监听多个包的 `dist/.build-complete`：

```ts
errorMockDevWatcher({ watch: ['ui'] });
```

如果要监听更多包，需要这些包也在构建完成后写入同名 marker 文件（目前已为 `ui` 配置）。
