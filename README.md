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

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
pnpm test:coverage
```

### 运行示例

```bash
cd examples/vite-example
pnpm install
pnpm dev
```

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
