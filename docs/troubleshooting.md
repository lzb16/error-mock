# 常见问题

## 1) 没看到悬浮按钮 / 面板打不开

- 确认是开发环境（Vite `dev` / Umi `dev`），生产构建会跳过注入
- 控制台搜索 `[ErrorMock]` 日志（解析失败/初始化失败会打印）
- 如果页面存在 Shadow DOM/CSS Reset，确认没有把按钮遮挡（按钮可拖动）

## 2) API 列表为空

默认解析器只扫描 `apiDir/<module>/index.ts` 且只识别顶层 `createRequest(...)`。

- 检查插件 `apiDir` 配置是否正确
- 检查 API 文件是否符合 `docs/api-parsing.md` 的支持写法
- Webpack/Umi3：确认 dev server 具备读取 `src/api` 的权限（默认没问题）

## 3) 规则已配置但请求没被 mock

- 确认在面板里点了 `Apply`
- 确认 Method 与 URL 匹配（`GET/POST/...`）
- 绝对 URL 会按 `pathname + search` 做匹配（例如 `https://a.com/api/user?id=1`）
- 某些请求可能被 bypass（例如 `OPTIONS`），可根据需要扩展 bypass 配置（目前 UI 未暴露）

## 4) localStorage 格式与清理

默认前缀为 `error-mock`：

- `error-mock:rules`：保存 `{ version, rules }`
- `error-mock:config`：保存全局配置

手动清理：

```js
localStorage.removeItem('error-mock:rules');
localStorage.removeItem('error-mock:config');
```

## 5) Webpack/Umi3 运行时代码写入位置

webpack 插件默认将运行时代码写到：

- `node_modules/.cache/error-mock/error-mock-runtime-entry.js`

若项目环境不允许写入 `node_modules`，可配置 `runtimeDir`：

```ts
new ErrorMockWebpackPlugin({
  apiDir: 'src/api',
  runtimeDir: '.error-mock',
});
```

## 6) 开启调试日志（Webpack）

- 配置项：`new ErrorMockWebpackPlugin({ debug: true })`
- 或环境变量：`ERROR_MOCK_DEBUG=1`
