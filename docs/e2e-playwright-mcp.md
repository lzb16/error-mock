# E2E（npm 包方式）+ Playwright MCP

目标：用“打包出来的 tgz”（模拟 npm 安装）运行示例，然后用 Playwright MCP 做 UI/E2E 验证。

## 1) 生成 tgz + consumer 示例

在仓库根目录：

```bash
pnpm e2e:prepare
```

会做三件事：

- `pnpm -r --filter @error-mock/* build`（确保各包 `dist/` 就绪）
- `pnpm pack` 生成 `e2e/packs/*.tgz`（产物内会把 `workspace:*` 替换成真实版本）
- 生成并安装两个 consumer 项目（使用 `pnpm install --ignore-workspace`，避免链接 workspace 包）：
  - `e2e/consumers/vite`
  - `e2e/consumers/umi3`

## 2) 启动示例

Vite consumer：

```bash
pnpm -C e2e/consumers/vite dev
```

打开 `http://127.0.0.1:4173`。

Umi3 consumer：

```bash
pnpm -C e2e/consumers/umi3 dev
```

打开 `http://127.0.0.1:8000`（端口以实际输出为准）。

## 3) Playwright MCP 操作要点

推荐直接按 `MANUAL_E2E_TEST.md` 里的步骤验证（UI 注入、RuleEditor Apply/Cancel、Network/Response tab）。

定位浮动按钮（可点开面板）：

- `aria-label` 可能是 `打开/关闭错误模拟面板`（中文）或 `Toggle Error Mock Panel`（英文）

## 4) 快速对照（非 consumer）

如果只是想在 workspace 内快速确认“按包名导入”的链路，Vite 示例提供了 consumer 配置：

```bash
pnpm -C examples/vite-example dev:npm
```

这不会打 tgz，也不会 `--ignore-workspace`，但能快速验证 `import '@error-mock/plugin'` 这条路径。
