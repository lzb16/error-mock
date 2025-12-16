# Manual E2E Checklist

目标：验证 Vite / Webpack(Umi3) 示例在“只安装插件”的情况下可正常注入 UI，并且 RuleEditor 的 `Apply/Cancel`、Response/Network 两个 tab 工作正常（含 Cancel 代理撤销崩溃的回归用例）。

## 0) 准备

```bash
pnpm install
```

### npm 包方式（consumer，推荐发布前验证）

```bash
pnpm e2e:prepare
pnpm -C e2e/consumers/vite dev
pnpm -C e2e/consumers/umi3 dev
```

> consumer 模式会用 `pnpm pack` 生成 `tgz` 并用 `pnpm install --ignore-workspace` 安装，尽量贴近真实 npm 安装行为。

### Vite 示例

```bash
pnpm dev
```

打开 `http://127.0.0.1:5173`（端口以实际输出为准）。

### Umi3 示例

```bash
pnpm -C examples/umi3-example dev
```

打开 `http://127.0.0.1:8000`（端口以实际输出为准）。

## 1) UI 注入与 API 列表

1. 页面右下角出现蓝色魔杖按钮（可拖动）
2. 点击按钮打开面板
3. 左侧能看到 `user`、`storage` 两个 module（至少 6 个 API）
4. 点击任意 API，右侧出现 RuleEditor：
   - 顶部显示 `Method`、`name`、`url`
   - `Mock` 开关可切换
   - 默认有 2 个 tab：`Response` / `Network`

## 2) Response：成功与业务错误

1. 选择 `GET /api/user/info`（或任意 API）
2. 打开 RuleEditor：开启 `Mock` 开关
3. `Response` tab：保持 `Status = 200`
4. 在 `result` 文本框输入：
   - `{"from":"error-mock","ok":true}`
5. 点击 `Apply`
6. 回到示例页面点击对应按钮（Vite 示例：`Get User`；Umi 示例：`Get User`）
7. **期望**：页面 `Result` 区域显示 `{"from":"error-mock","ok":true}`（或包含该字段）

业务错误：
1. 在 `err_no` 改为 `1001`，`detail_err_msg` 写入任意文本
2. 点击 `Apply`
3. 再触发同一请求
4. **期望**：示例页面以 error 样式显示错误（message 包含 `detail_err_msg/err_msg`）

## 3) Response：HTTP 错误（非 2xx/3xx）

1. 将 `Status` 改为 `404`
2. 在 `errorBody` 文本框输入：`{"error":"Not Found"}`
3. 点击 `Apply`
4. 触发同一请求
5. **期望**：示例页面显示 error（或能在 Network/Console 看到 404 + 自定义 body）

## 4) Network：超时/断网/随机失败/延迟

1. 切到 `Network` tab
2. 设置 `Timeout` → `Apply` → 触发请求
   - **期望**：示例页面报错（通常为超时/Abort/Failed to fetch）
3. 设置 `Offline` → `Apply` → 触发请求
   - **期望**：示例页面报错（类似离线）
4. 勾选 `Random failure`，把滑块拉到 `100%` → `Apply` → 触发请求
   - **期望**：每次都报错
5. 切回 `None`（关闭 error）并设置 delay 为 `Override + customDelay=800` → `Apply`
   - **期望**：请求延后返回（可通过视觉等待或 Network timing 观察）

## 5) 回归：RuleEditor 点击 Cancel 不应崩溃（Immer revoked proxy）

复现/验证步骤：
1. 选择任意 API，开启 `Mock`
2. `Response` tab：在 `result` 输入一个对象 JSON（例如 `{"a":1}`）
3. 点击 `Apply`
4. 再把 `result` 改成另一个对象（例如 `{"a":2}`），但**不要** Apply
5. 点击 `Cancel`
6. **期望**：
   - `result` 回滚到已 Apply 的值（`{"a":1}`）
   - 页面不出现 React error overlay
   - 控制台无 `Cannot perform 'get' on a proxy that has been revoked`

## 6) “一次安装就够”检查点

示例项目无需安装 `@error-mock/ui`：

- Vite：只依赖 `@error-mock/plugin`
- Umi3：只 devDependency `@error-mock/plugin`

只要插件生效，UI 会自动注入并 mount。

---

**Test Date:** [fill]
**Tester:** [fill]
**Status:** [PASS/FAIL]
**Notes:** [fill]
