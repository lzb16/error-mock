# Error Mock Plugin

一个用于前端开发的网络请求 Mock 插件，支持模拟网络异常、业务异常、响应体字段缺失等场景，帮助测试前端健壮性。

## 特性

### 核心功能

- 🌐 **网络异常模拟** - 延迟、超时、断网、随机失败（基于概率）
- 💼 **业务异常模拟** - 自定义 err_no、err_msg、detail_err_msg
- ✅ **成功响应模拟** - 自定义 result 数据或使用默认值
- 🔍 **字段缺失模拟** - 手动指定或随机删除字段（测试前端防御性编程）
- 📁 **API 自动解析** - 解析 `src/api` 目录自动生成规则
- 🔌 **自定义适配器** - 支持不同项目的 API 结构
- 📦 **批量操作** - 多选 API 批量配置
- 💾 **配置持久化** - localStorage 保存规则 + 全局配置文件

### 技术特点

- **拦截方式**: XHR/Fetch 劫持（支持绝对/相对 URL）
- **UI 框架**: Svelte + Tailwind CSS（em- 前缀避免样式冲突）
- **构建插件**: Webpack (umi3) + Vite
- **项目结构**: pnpm monorepo
- **测试**: Vitest，90%+ 覆盖率，137 个测试
- **环境**: 仅开发环境，生产构建完全剔除

## 安装

### 使用 Vite

```bash
npm install @error-mock/vite-plugin --save-dev
```

```typescript
// vite.config.ts
import errorMockPlugin from '@error-mock/vite-plugin';

export default {
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api', // API 目录路径
    }),
  ],
};
```

### 使用 Webpack (umi3)

```bash
npm install @error-mock/webpack-plugin --save-dev
```

```typescript
// .umirc.ts
export default {
  chainWebpack(config) {
    config.plugin('error-mock').use(ErrorMockWebpackPlugin, [{
      apiDir: 'src/api',
    }]);
  },
};
```

## API 定义格式

插件识别以下 API 定义模式：

```typescript
// src/api/user/index.ts
export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
});

export const loginUrl = '/api/user/login';
export const login = createRequest<LoginResponse, LoginRequest>({
  url: loginUrl,
  method: 'POST',
});
```

## 使用方法

1. **启动开发服务器** - 插件会自动注入
2. **查看悬浮按钮** - 右下角蓝色圆形按钮
3. **打开配置面板** - 点击按钮
4. **选择 API** - 勾选要 mock 的接口
5. **配置规则**:
   - Mock Type: Pass/Success/Business Error/Network Error
   - Network: 延迟、超时、断网、随机失败率
   - Business Error: 错误码、错误信息
   - Field Omission: 手动指定字段或随机删除
6. **Apply** - 应用配置
7. **触发请求** - 请求会被 mock

## 响应结构

插件支持以下响应结构：

```typescript
{
  err_no: number,           // 0 成功，非 0 业务错误
  err_msg: string,          // 错误信息
  detail_err_msg: string,   // 详细错误信息
  result: T,                // 业务数据
  sync: boolean,
  time_stamp: number,
  time_zone_ID: string,
  time_zone_offset: number,
  trace_id: string
}
```

## 字段缺失模拟

### 手动模式

指定具体要删除的字段路径：

```
result.name
result.user.profile.age
```

### 随机模式

- **Probability**: 每个字段被删除的概率 (0-100%)
- **Max Count**: 最多删除几个字段
- **Depth Limit**: 最大遍历深度
- **Excluded Fields**: 保护的字段（永不删除）
- **Omit Mode**: delete / undefined / null

## 项目结构

```
error-mock-plugin/
├── packages/
│   ├── core/          # 核心逻辑（拦截器、引擎、存储）
│   ├── parser/        # API 文件解析
│   ├── ui/            # Svelte + Tailwind UI
│   ├── webpack-plugin/
│   └── vite-plugin/
├── examples/
│   └── vite-example/  # 示例项目
└── docs/
    └── plans/         # 设计文档
```

## 开发

### 快速开始

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动热更新开发模式（推荐）
pnpm dev
```

开发服务器启动后，访问 `http://localhost:3000` 查看示例项目。

### 热更新开发流程

**单命令启动**（自动热更新）：

```bash
pnpm dev
```

**工作流程**：
1. 修改 `packages/ui/src/` 中的任何文件
2. Vite 自动检测变化并重新构建（~2秒）
3. 浏览器自动刷新，查看更新 ✅

**并行运行的进程**：
- `packages/ui`: `vite build --watch` 监听UI源码
- `examples/vite-example`: Vite dev server 在 http://localhost:3000

**详细架构说明**：参见 [docs/hot-reload-architecture.md](./docs/hot-reload-architecture.md)

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### 手动构建单个包

```bash
# 构建 core 包
pnpm --filter @error-mock/core build

# 构建 UI 包
pnpm --filter @error-mock/ui build

# 构建 vite-plugin 包
pnpm --filter @error-mock/vite-plugin build
```

## 调试方式

### 1. 检查插件是否正确注入

打开浏览器控制台，输入：

```javascript
window.__ERROR_MOCK_INSTALLED__
```

如果返回 `true`，说明插件已成功注入。

### 2. 查看控制台日志

插件会在以下情况输出日志：

```javascript
// 所有日志都以 [ErrorMock] 前缀标识
[ErrorMock] API directory not found: /path/to/api
[ErrorMock] Failed to save rules: Error message
[ErrorMock] Failed to parse /path/to/file: Error message
```

### 3. 检查 localStorage 配置

在浏览器控制台查看已保存的配置：

```javascript
// 查看所有规则
JSON.parse(localStorage.getItem('error-mock:rules'))

// 查看全局配置
JSON.parse(localStorage.getItem('error-mock:config'))

// 清空所有配置
localStorage.removeItem('error-mock:rules')
localStorage.removeItem('error-mock:config')
```

### 4. 追踪 Mock 请求

每个 Mock 响应都包含唯一的 `trace_id`：

```javascript
// 在响应中查看
{
  "trace_id": "[1a2b3c4d5e]",
  "err_no": 0,
  "result": { ... }
}
```

使用 Network 面板过滤：
1. 打开 DevTools → Network 标签
2. 在 Filter 输入框输入请求 URL
3. 查看 Response 中的 `trace_id` 字段
4. Mock 的请求状态码固定为 200

### 5. 检查拦截器状态

```javascript
// 查看当前的 Mock 规则
window.__ERROR_MOCK_RULES__

// 手动触发规则更新（高级用法）
import { updateRules } from '@error-mock/core';
updateRules(newRules);
```

### 6. 常见问题排查

#### 问题：插件未生效

**检查清单：**
- ✅ 确认是开发环境（`process.env.NODE_ENV !== 'production'`）
- ✅ 检查插件配置中的 `apiDir` 路径是否正确
- ✅ 确认 API 文件符合 `createRequest` 模式
- ✅ 查看控制台是否有错误日志

#### 问题：Mock 规则不生效

**排查步骤：**
1. 检查规则是否已启用（`enabled: true`）
2. 检查 URL 和 Method 是否完全匹配
3. 查看是否被 Bypass 配置排除
4. 使用浏览器 Network 面板确认请求实际 URL

#### 问题：UI 面板打不开

**可能原因：**
- 样式未正确加载 → 检查 Tailwind CSS 是否正确配置
- 按钮被其他元素遮挡 → 尝试拖动按钮位置
- JavaScript 错误 → 查看控制台错误信息

#### 问题：配置丢失

**原因分析：**
- localStorage 被清空
- 浏览器隐私模式
- 切换了不同域名/端口

**解决方案：**
```javascript
// 导出配置备份
const storage = new RuleStorage();
const backup = storage.exportConfig();
console.log(backup); // 复制保存

// 导入配置
storage.importConfig(backup);
```

### 7. 启用详细日志（开发模式）

在项目中添加全局配置：

```javascript
// 在应用入口文件（如 main.ts）添加
if (import.meta.env.DEV) {
  window.__ERROR_MOCK_DEBUG__ = true;
}
```

这将启用详细的调试日志输出。

### 8. 使用 Vue/React DevTools

插件状态可以通过组件开发工具查看：

- **Vue DevTools**: 查看 Svelte 组件状态（如果使用 Svelte DevTools）
- **React DevTools**: 不适用（插件使用 Svelte）
- **浏览器 Elements**: 检查 `.em-` 前缀的样式元素

## 技术细节

### 拦截实现

- **XHR 拦截**: 完整 readyState 转换、responseType 支持、headers 管理
- **Fetch 拦截**: AbortSignal 支持、正确的错误类型（DOMException/TypeError）
- **URL 匹配**: path-to-regexp 支持路径参数
- **Bypass 配置**: origins、methods、contentTypes、urlPatterns

### 字段删除

- **确定性随机**: mulberry32 seeded RNG
- **Fisher-Yates Shuffle**: 确保跨引擎一致性
- **深度限制**: 防止过深遍历
- **保护字段**: excludeFields 包含子字段

### UI 特性

- **Viewport Clamping**: 按钮永远在可见区域
- **Focus Trap**: Modal 内键盘导航循环
- **Keyboard Shortcuts**: ⌘K 聚焦搜索、ESC 关闭
- **Batch Editing**: 追踪 editedFields，只应用修改的字段
- **Status Indicators**: 🟢 成功 / 🔴 错误 / ⚪ 禁用

## 测试覆盖率

```
Lines:      91.98% ✓
Statements: 91.98% ✓
Branches:   90.14% ✓
Functions:  95.58% ✓
Tests:      137 个全部通过
```

## 审核状态

- ✅ Codex 审核通过
- ✅ Gemini 审核通过
- ✅ 所有严重/重要问题已修复

## License

MIT
