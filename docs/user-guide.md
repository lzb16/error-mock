# Error Mock 使用指南

Error Mock 是一个面向前端开发环境的请求 Mock 工具，可在浏览器端拦截 `fetch` / `XMLHttpRequest` 请求，通过可视化面板配置 Mock 规则。

## 目录

- [安装与配置](#安装与配置)
- [API 定义约定](#api-定义约定)
- [界面操作指南](#界面操作指南)
- [功能详解](#功能详解)
- [插件配置选项](#插件配置选项)
- [常见问题](#常见问题)

---

## 安装与配置

### Vite 项目

```bash
npm i -D @error-mock/plugin
# 或
pnpm add -D @error-mock/plugin
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/plugin';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',  // API 定义目录
    }),
  ],
});
```

### Webpack / Umi3 项目

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
        // Umi 项目通常需要配置 stripPrefixes
        match: {
          stripPrefixes: ['/api'],  // 去除代理前缀
        },
      },
    ]);
  },
});
```

> **注意**：生产环境默认不注入、不生效。

---

## API 定义约定

Error Mock 会自动扫描 `apiDir` 目录下的 API 定义文件，生成 API 列表供 UI 展示。

### 目录结构

```
src/api/
├── user/
│   └── index.ts      # 用户相关 API
├── order/
│   └── index.ts      # 订单相关 API
└── product/
    └── index.ts      # 商品相关 API
```

### API 定义格式

默认解析器识别 `createRequest` 形式的调用：

```ts
// src/api/user/index.ts
import { createRequest } from '@/utils/request';

// 方式一：URL 变量 + createRequest
export const getUserInfoUrl = '/user/info';
export const getUserInfo = createRequest<GetUserInfoResponse, GetUserInfoRequest>({
  url: getUserInfoUrl,
  method: 'GET',
});

// 方式二：直接字符串
export const updateUser = createRequest<UpdateUserResponse, UpdateUserRequest>({
  url: '/user/update',
  method: 'POST',
});
```

### 解析结果

上述定义会被解析为：

| 模块 | 名称 | 方法 | URL |
|------|------|------|-----|
| user | getUserInfo | GET | /user/info |
| user | updateUser | POST | /user/update |

---

## 界面操作指南

### 1. 打开面板

启动开发服务器后，页面右下角会出现一个蓝色魔杖按钮。

<!-- 📸 图片位置：悬浮按钮截图 -->
<!-- 建议：截取页面右下角，显示蓝色魔杖图标按钮 -->
> **[图1]** 悬浮按钮位置

点击按钮打开配置面板。

### 2. 面板概览

面板分为左右两栏：

- **左侧**：API 列表（按模块分组）
- **右侧**：规则编辑器

<!-- 📸 图片位置：完整面板截图 -->
<!-- 建议：截取整个面板，展示左侧 API 列表和右侧编辑区域 -->
> **[图2]** 面板整体布局

### 3. 选择 API

在左侧列表中：

- 点击模块名称可展开/折叠
- 使用顶部搜索框快速查找（支持 `Ctrl/Cmd + K` 快捷键）
- 绿色圆点表示该 API 已启用 Mock

<!-- 📸 图片位置：API 列表截图 -->
<!-- 建议：展示包含多个模块、部分已启用的 API 列表 -->
> **[图3]** API 列表与状态指示

### 4. 启用 Mock

选中 API 后，在右侧顶部找到 **Mock 开关**，打开即可启用拦截。

<!-- 📸 图片位置：Mock 开关截图 -->
<!-- 建议：截取右上角区域，展示 API 名称和 Mock 开关 -->
> **[图4]** Mock 开关位置

### 5. 配置响应数据（Response Tab）

Response 标签页用于配置 Mock 返回的数据：

<!-- 📸 图片位置：Response 标签页完整截图 -->
<!-- 建议：展示 Status 选择、业务字段、result JSON 编辑区、模板侧边栏 -->
> **[图5]** Response 配置界面

#### 5.1 HTTP 状态码

选择响应的 HTTP 状态码：

- **2xx**：正常响应，返回业务数据结构 `{ err_no, err_msg, result, ... }`
- **4xx/5xx**：HTTP 错误，直接返回自定义 JSON

#### 5.2 业务字段（2xx 状态码时）

| 字段 | 说明 |
|------|------|
| `err_no` | 业务错误码，`0` 表示成功 |
| `err_msg` | 错误信息简述 |
| `detail_err_msg` | 详细错误信息 |

#### 5.3 result JSON

编辑返回的业务数据：

```json
{
  "userId": 12345,
  "username": "test_user",
  "email": "test@example.com"
}
```

#### 5.4 业务模板

右侧提供快捷模板：

- **正常返回**：`err_no = 0`
- **模拟异常**：`err_no = 999`

点击模板可快速填充业务字段。

<!-- 📸 图片位置：业务模板截图 -->
<!-- 建议：截取右侧模板列表区域 -->
> **[图6]** 业务模板快捷选择

### 6. 配置网络模拟（Network Tab）

Network 标签页用于模拟各种网络状况：

<!-- 📸 图片位置：Network 标签页完整截图 -->
<!-- 建议：展示延迟配置、网络错误选项、失败率配置 -->
> **[图7]** Network 配置界面

#### 6.1 延迟配置

- **跟随全局**：使用全局网络配置
- **自定义**：为当前 API 单独设置延迟

网络档位预设：

| 档位 | 延迟 |
|------|------|
| None | 0ms |
| Fast 4G | 150ms |
| Slow 3G | 500ms |
| 2G | 1500ms |

#### 6.2 网络错误模拟

- **超时（Timeout）**：模拟请求超时
- **断网（Offline）**：模拟网络断开

#### 6.3 随机失败率

设置 0-100% 的失败概率，用于测试应用的容错能力。

### 7. 应用与取消

配置完成后：

- **Apply（应用修改）**：保存并生效
- **Cancel（取消）**：放弃当前修改，恢复到上次应用的状态

<!-- 📸 图片位置：底部按钮截图 -->
<!-- 建议：截取 Apply 和 Cancel 按钮区域 -->
> **[图8]** 应用与取消按钮

### 8. 全局设置

点击左下角的设置图标，可配置：

- 悬浮按钮位置
- 主题（跟随系统 / 亮色 / 暗色）
- 全局网络档位
- 语言切换

<!-- 📸 图片位置：设置弹窗截图 -->
<!-- 建议：展示完整的设置弹窗 -->
> **[图9]** 全局设置

---

## 功能详解

### Mock 规则持久化

所有配置自动保存在浏览器 `localStorage` 中，刷新页面后规则依然生效。

### 请求拦截原理

Error Mock 在运行时拦截 `fetch` 和 `XMLHttpRequest`：

1. 请求发出前，检查是否匹配已启用的 Mock 规则
2. 匹配成功则返回配置的 Mock 数据
3. 未匹配的请求正常发送到服务器

### 响应数据结构

2xx 状态码时，返回标准业务结构：

```json
{
  "err_no": 0,
  "err_msg": "",
  "detail_err_msg": "",
  "result": { ... },
  "sync": true,
  "time_stamp": 1702900000000,
  "time_zone_ID": "Asia/Shanghai",
  "time_zone_offset": -480,
  "trace_id": "[abc1234567]"
}
```

4xx/5xx 状态码时，直接返回 `errorBody` 中配置的 JSON。

---

## 插件配置选项

```ts
interface ErrorMockPluginOptions {
  // API 定义目录（相对于项目根目录）
  apiDir?: string;  // 默认 'src/api'

  // 运行时文件输出目录
  runtimeDir?: string;  // 默认 'node_modules/.cache/error-mock'

  // 启用调试日志
  debug?: boolean;  // 默认 false

  // 默认 HTTP 方法（当 API 定义未指定时）
  defaultMethod?: string;  // 默认 'GET'

  // 请求匹配选项
  match?: {
    // 匹配前去除的 URL 前缀（常用于代理场景）
    stripPrefixes?: string[];  // 如 ['/api']
  };
}
```

### Umi 代理场景示例

Umi 项目通常配置了 `/api` 前缀代理：

```ts
// .umirc.ts
export default defineConfig({
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  chainWebpack(config) {
    config.plugin('error-mock').use(ErrorMockWebpackPlugin, [
      {
        apiDir: 'src/api',
        match: {
          stripPrefixes: ['/api'],  // 让 /api/user/info 匹配 /user/info 规则
        },
      },
    ]);
  },
});
```

---

## 常见问题

### Q: 面板打不开 / 按钮不显示？

1. 确认是开发环境（`NODE_ENV=development`）
2. 检查控制台是否有报错
3. 确认插件配置正确

### Q: Mock 规则不生效？

1. 确认 Mock 开关已打开
2. 确认点击了「应用修改」按钮
3. 检查 URL 是否匹配（注意代理前缀问题）

### Q: API 列表为空？

1. 确认 `apiDir` 路径正确
2. 确认 API 定义符合解析规则（`createRequest` 形式）
3. 查看终端是否有解析错误

### Q: 如何清除所有 Mock 规则？

打开浏览器开发者工具，在 Application > Local Storage 中删除 `error-mock-rules` 和 `error-mock-config` 键。

---

## 图片清单

| 序号 | 位置 | 内容建议 |
|------|------|----------|
| 图1 | 悬浮按钮 | 页面右下角蓝色魔杖按钮 |
| 图2 | 面板概览 | 完整面板，左侧 API 列表 + 右侧编辑器 |
| 图3 | API 列表 | 展开的模块列表，含启用状态指示 |
| 图4 | Mock 开关 | 右上角 API 信息栏和开关 |
| 图5 | Response 配置 | Response 标签页完整界面 |
| 图6 | 业务模板 | 右侧模板选择区域 |
| 图7 | Network 配置 | Network 标签页完整界面 |
| 图8 | 操作按钮 | Apply 和 Cancel 按钮 |
| 图9 | 全局设置 | 设置弹窗内容 |
