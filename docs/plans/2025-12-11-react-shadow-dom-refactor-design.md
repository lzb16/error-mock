# UI 重构设计文档：React 18 + Shadow DOM + shadcn/ui

> **版本**: v1.1
> **创建日期**: 2025-12-11
> **状态**: ✅ 已确认，待实施
> **审核**: Codex 审核通过（2025-12-11）

---

## 1. 背景与目标

### 1.1 当前问题

1. **样式污染**：宿主页面的全局 CSS 影响插件 UI 显示
2. **组件质量**：手写 Svelte 组件 bug 多，维护成本高
3. **Svelte 生态限制**：Svelte 4 可用的成熟组件库有限

### 1.2 重构目标

1. **样式隔离**：使用 Shadow DOM 彻底隔离宿主与插件样式
2. **组件质量**：使用 shadcn/ui 成熟组件库，减少自研 bug
3. **简化功能**：移除批量编辑，用全局设置替代

---

## 2. 技术栈

| 层面 | 选型 | 版本 | 说明 |
|------|------|------|------|
| UI 框架 | React | 18.x | 事件系统与 Shadow DOM 兼容 |
| 组件库 | shadcn/ui | latest | 源码可控，基于 Radix UI |
| 底层组件 | Radix UI | latest | headless 组件 |
| 样式 | Tailwind CSS | 3.x | 注入到 Shadow Root |
| 样式隔离 | Shadow DOM | - | 原生 Web API |
| 状态管理 | Zustand | 4.x | 轻量，接近 Svelte store 心智模型 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 构建 | Vite | 5.x | lib 模式输出 ES module |

---

## 3. 影响范围

| 包 | 改动类型 | 说明 |
|----|---------|------|
| `packages/ui` | **全部重写** | Svelte → React |
| `packages/vite-plugin` | 修改 | 挂载逻辑适配 React + Shadow DOM |
| `packages/webpack-plugin` | 修改 | 同上 |
| `packages/core` | 扩展 | GlobalConfig 增加 `defaults` 字段 |
| `packages/parser` | 不变 | - |

---

## 4. 功能变更

| 功能 | 变更 | Phase | 说明 |
|------|------|-------|------|
| 批量编辑 | ❌ 移除 | 2 | 用全局默认值替代 |
| 多选 | ❌ 移除 | 2 | 只支持单选编辑 |
| 全局设置面板 | ✅ 新增 | 3 | Settings 组件 |
| 默认规则设置 | ✅ 新增 | 3 | 作用于新建规则 |
| "应用到所有" | ✅ 新增 | 3 | 批量覆盖现有规则 |
| 字段级重置 | ✅ 新增 | 3 | 单字段重置到默认值 |

---

## 5. 架构设计

### 5.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    宿主页面 (Host Page)                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            #error-mock-root (Shadow Host)           │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │              Shadow DOM                       │  │ │
│  │  │  ┌─────────────────────────────────────────┐ │  │ │
│  │  │  │  <style> Tailwind + shadcn CSS 变量     │ │  │ │
│  │  │  └─────────────────────────────────────────┘ │  │ │
│  │  │  ┌─────────────────────────────────────────┐ │  │ │
│  │  │  │  React 18 App                           │ │  │ │
│  │  │  │  ├── FloatButton                        │ │  │ │
│  │  │  │  ├── Modal (Dialog)                     │ │  │ │
│  │  │  │  │   ├── ApiList                        │ │  │ │
│  │  │  │  │   └── RuleEditor                     │ │  │ │
│  │  │  │  └── Toast                              │ │  │ │
│  │  │  └─────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 5.2 目录结构

```
packages/ui/
├── src/
│   ├── index.ts              # 导出 mount 函数
│   ├── mount.tsx             # Shadow DOM 挂载逻辑
│   ├── App.tsx               # React 根组件
│   ├── context/
│   │   └── ShadowRootContext.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── FloatButton.tsx
│   │   ├── Modal.tsx
│   │   ├── ApiList.tsx
│   │   ├── Settings.tsx      # 新增
│   │   └── RuleEditor/
│   │       ├── index.tsx
│   │       └── tabs/
│   ├── stores/
│   │   ├── useRulesStore.ts
│   │   ├── useConfigStore.ts
│   │   └── useToastStore.ts
│   ├── hooks/
│   │   └── useInterceptor.ts
│   ├── styles/
│   │   └── globals.css
│   └── lib/
│       └── utils.ts
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── components.json
```

---

## 6. 类型定义

### 6.1 GlobalConfig 扩展

```typescript
// packages/core/src/types.ts

export type FloatButtonPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface RuleDefaults {
  delay: number;
  mockType: MockRule['mockType'];
  failRate: number;
  timeout: boolean;
  offline: boolean;
  business: {
    errNo: number;
    errMsg: string;
    detailErrMsg: string;
  };
}

export interface GlobalConfig {
  // 应用设置（自动保存）
  enabled: boolean;
  position: FloatButtonPosition;
  theme: ThemeMode;
  keyboardShortcuts: boolean;

  // 默认规则设置（手动保存）
  defaults: RuleDefaults;
}

export const DEFAULT_RULE_DEFAULTS: RuleDefaults = {
  delay: 0,
  mockType: 'none',
  failRate: 0,
  timeout: false,
  offline: false,
  business: {
    errNo: 0,
    errMsg: '',
    detailErrMsg: '',
  },
};

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  enabled: true,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
  defaults: DEFAULT_RULE_DEFAULTS,
};
```

---

## 7. Shadow DOM 处理

### 7.1 挂载流程（含幂等性处理）

```tsx
// packages/ui/src/mount.tsx
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import { ShadowRootProvider } from './context/ShadowRootContext';
import styles from './styles/globals.css?inline';

let root: Root | null = null;
let hostElement: HTMLElement | null = null;

export function mount(options: MountOptions): void {
  // 幂等性检查：防止重复挂载
  if (root) {
    console.warn('[ErrorMock] Already mounted, skipping');
    return;
  }

  // DOM 可用性检查
  if (!document.body) {
    console.error('[ErrorMock] document.body not available');
    return;
  }

  // 1. 创建 Shadow Host
  hostElement = document.createElement('div');
  hostElement.id = 'error-mock-root';
  document.body.appendChild(hostElement);

  // 2. 创建 Shadow Root
  const shadowRoot = hostElement.attachShadow({ mode: 'open' });

  // 3. 注入样式
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadowRoot.appendChild(styleEl);

  // 4. 创建 React 容器
  const container = document.createElement('div');
  container.id = 'error-mock-app';
  shadowRoot.appendChild(container);

  // 5. 挂载 React
  root = createRoot(container);
  root.render(
    <ShadowRootProvider shadowRoot={shadowRoot}>
      <App metas={options.metas} />
    </ShadowRootProvider>
  );
}

export function unmount(): void {
  if (root) {
    root.unmount();
    root = null;
  }
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
  }
}

export function isMounted(): boolean {
  return root !== null;
}
```

### 7.2 弹层组件处理

**需要配置 `container` 的 Radix 组件清单**：

| 组件 | Portal 组件 | 必须配置 |
|------|------------|---------|
| Dialog | DialogPortal | ✅ |
| AlertDialog | AlertDialogPortal | ✅ |
| DropdownMenu | DropdownMenuPortal | ✅ |
| Select | SelectPortal | ✅ |
| Popover | PopoverPortal | ✅ |
| Tooltip | TooltipPortal | ✅ |
| ContextMenu | ContextMenuPortal | ✅ |
| HoverCard | HoverCardPortal | ✅ |
| Toast | ToastViewport | ✅ |

**统一处理方案**：使用 `usePortalContainer` hook

```tsx
// packages/ui/src/context/ShadowRootContext.tsx
export function usePortalContainer(): HTMLElement {
  const shadowRoot = useShadowRoot();
  const container = shadowRoot.getElementById('error-mock-app');
  if (!container) {
    throw new Error('Portal container not found in Shadow Root');
  }
  return container;
}
```

**组件封装示例**：

```tsx
const DialogPortal = ({ children, ...props }) => {
  const container = usePortalContainer();

  return (
    <DialogPrimitive.Portal container={container} {...props}>
      {children}
    </DialogPrimitive.Portal>
  );
};
```

### 7.3 CSS 变量与 Preflight

**问题**：Tailwind 的 preflight（基础重置样式）默认使用 `html, body` 选择器，在 Shadow DOM 内不生效。

**解决方案**：在 globals.css 中为 Shadow DOM 重写关键重置样式

```css
/* packages/ui/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Shadow DOM 样式变量 + 基础重置 */
:host {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;

  /* 基础样式 */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: hsl(var(--foreground));
  background-color: transparent;
}

/* Shadow DOM 内的 preflight 重置 */
#error-mock-app {
  all: initial;
  display: block;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

#error-mock-app *,
#error-mock-app *::before,
#error-mock-app *::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: hsl(var(--border));
}

#error-mock-app button,
#error-mock-app input,
#error-mock-app select,
#error-mock-app textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}

#error-mock-app button {
  background-color: transparent;
  cursor: pointer;
}
```

---

## 8. 设置面板设计

### 8.1 交互规则

| 区域 | 保存方式 | 说明 |
|------|---------|------|
| 应用设置（位置、主题、快捷键） | **自动保存** | 改完即生效 |
| 默认规则设置 | **手动保存** | 需点击"保存默认值" |
| "应用到所有现有规则" | **需确认** | 批量操作，防误触 |

### 8.2 字段级重置

单个规则编辑时，每个字段旁有重置图标（仅当值与默认值不同时显示），点击可重置到全局默认值。

```tsx
<ResettableField
  label="延迟"
  isModified={rule.network.delay !== defaults.delay}
  onReset={() => resetField(rule.id, 'network.delay')}
>
  <Input value={rule.network.delay} onChange={...} />
</ResettableField>
```

---

## 9. 渐进式迁移计划

### Phase 0：骨架验证

**目标**：验证技术栈可行性

- [ ] React 18 + Shadow DOM 基础挂载
- [ ] shadcn/ui Button 样式验证
- [ ] shadcn/ui Dialog 弹层验证
- [ ] Tailwind 样式注入 Shadow Root
- [ ] 样式隔离测试

### Phase 1：核心容器迁移

**目标**：基础 UI 框架可用

- [ ] FloatButton 组件
- [ ] Modal 外壳
- [ ] 基础布局（Header + Sidebar + Content）
- [ ] Zustand stores 骨架

### Phase 2：主要功能迁移

**目标**：核心编辑功能可用

- [ ] ApiList（单选模式，无 checkbox）
- [ ] RuleEditor 容器
- [ ] NetworkTab
- [ ] ResponseTab
- [ ] AdvancedTab
- [ ] **移除批量编辑相关代码**

### Phase 3：全局设置功能

**目标**：全局设置替代批量编辑

- [ ] Settings 面板组件
- [ ] GlobalConfig 扩展 `defaults` 字段
- [ ] 应用设置自动保存
- [ ] 默认规则设置手动保存
- [ ] "应用到所有"按钮
- [ ] 字段级重置功能
- [ ] Toast 通知

### Phase 4：清理与优化

**目标**：完成迁移，清理旧代码

- [ ] 删除 Svelte 依赖
- [ ] 删除旧 `.svelte` 组件
- [ ] 打包优化
- [ ] 文档更新
- [ ] E2E 测试

---

## 10. 数据迁移计划

### 10.1 GlobalConfig 迁移

**问题**：旧版 GlobalConfig 没有 `defaults` 字段，需要向后兼容。

**解决方案**：启动时检测并自动填充

```typescript
// packages/ui/src/stores/useConfigStore.ts
import { DEFAULT_RULE_DEFAULTS } from '@error-mock/core';

function migrateConfig(stored: unknown): GlobalConfig {
  const config = stored as Partial<GlobalConfig>;

  return {
    enabled: config.enabled ?? true,
    position: config.position ?? 'bottom-right',
    theme: config.theme ?? 'system',
    keyboardShortcuts: config.keyboardShortcuts ?? true,
    // 自动填充 defaults
    defaults: config.defaults ?? DEFAULT_RULE_DEFAULTS,
  };
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'error-mock-config',
      version: 2, // 版本号升级
      migrate: (persisted, version) => {
        if (version < 2) {
          return migrateConfig(persisted);
        }
        return persisted as ConfigState;
      },
    }
  )
);
```

### 10.2 批量编辑数据清理

**Phase 2 移除批量编辑时**：
- 清理 storage 中的 `selectedIds` 相关数据（如有）
- 不影响已保存的 MockRule 数据

---

## 11. 已知风险与对策

| 风险 | 严重程度 | 对策 |
|------|---------|------|
| **Radix UI 弹层默认挂载到 body** | 🟡 中 | 所有 Portal 组件配置 `container`，使用 `usePortalContainer` hook 统一处理 |
| **Tailwind preflight 不生效** | 🟡 中 | 在 globals.css 中为 `#error-mock-app` 重写关键重置样式 |
| **重复挂载/HMR 问题** | 🟡 中 | mount() 添加幂等性检查，暴露 unmount() API |
| **旧配置数据迁移** | 🟡 中 | Zustand persist middleware 添加 migrate 函数，自动填充 defaults |
| **scroll-lock 作用于 body** | 🟢 低 | 弹窗关闭时自动恢复，实际影响有限 |
| **Shadow DOM 内 aria-hidden 问题** | 🟢 低 | 不影响功能，仅影响 a11y |
| **DialogTitle 警告** | 🟢 低 | 可忽略或手动设置 aria |
| **z-index 层叠冲突** | 🟢 低 | Shadow DOM 内部 z-index 独立，与宿主不冲突 |

---

## 12. 参考资源

- [Radix UI Portal](https://www.radix-ui.com/primitives/docs/utilities/portal)
- [shadcn/ui](https://ui.shadcn.com/)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Radix Shadow DOM Issue #1772](https://github.com/radix-ui/primitives/issues/1772)

---

## 13. 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2025-12-11 | v1.0 | 初始设计文档 |
| 2025-12-11 | v1.1 | Codex 审核后更新：<br>- 添加 mount 幂等性处理<br>- 完善弹层组件清单<br>- 添加 CSS preflight 重写方案<br>- 新增数据迁移计划<br>- 完善风险列表 |
