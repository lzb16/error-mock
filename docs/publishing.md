# 发布到 npm

本仓库是 `pnpm` monorepo。对外使用推荐只安装 `@error-mock/plugin`，但发布时需要同时发布它依赖的包（`@error-mock/core` / `@error-mock/parser` / `@error-mock/ui`）。

## 发布前检查

```bash
pnpm install
pnpm build
pnpm test
```

建议在一个干净项目里做一次 `npm pack`/安装验证（确保 UI 能注入、示例可跑）。

## 版本管理

发布前需要更新各包的 `version`（以及内部依赖的版本范围），保持依赖关系可解析。

> 如果使用 `workspace:*` 协议，请确认你的发布流程会将其替换成实际版本（不同工具行为略有差异）。

## 发布命令（示例）

登录 npm：

```bash
npm login
```

发布核心包（建议按依赖顺序）：

```bash
pnpm -r publish --access public --filter @error-mock/core
pnpm -r publish --access public --filter @error-mock/parser
pnpm -r publish --access public --filter @error-mock/ui
pnpm -r publish --access public --filter @error-mock/plugin
```

如果也要发布兼容包（可选）：

```bash
pnpm -r publish --access public --filter @error-mock/vite-plugin
pnpm -r publish --access public --filter @error-mock/webpack-plugin
```

## GitHub Actions 发布（推荐）

适合本地网络不稳定或希望自动化发布的场景。

1. 在 npm 创建一个 **Automation** token（可绕过 2FA、具备 `@error-mock` 组织发布权限）。
2. 在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 添加 `NPM_TOKEN`。
3. 推送 tag（例如 `v0.0.2`）或在 Actions 页面手动触发 `Publish to npm` workflow。

> workflow 会先 build，再按依赖顺序依次发布 6 个包：`@error-mock/core`、`@error-mock/parser`、`@error-mock/ui`、`@error-mock/plugin`、`@error-mock/vite-plugin`、`@error-mock/webpack-plugin`。
