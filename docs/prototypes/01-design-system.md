# 设计系统规范 - GitHub Primer风格

> **基于**: GitHub Primer Design System
> **用途**: Error Mock Plugin UI设计的基础规范
> **状态**: ✅ 稳定，基本不会变更

---

## 配色系统

### 主要颜色

```css
/* Primary - GitHub Blue */
--color-primary: #0969DA;        /* blue-600, GitHub Link Blue */
--color-primary-hover: #0860CA;  /* blue-700 */

/* Success - GitHub Green */
--color-success: #1F883D;        /* green-600, GitHub绿 */
--color-success-hover: #1a7f37;  /* green-700 */

/* Danger - GitHub Red */
--color-danger: #CF222E;         /* red-600, GitHub红 */
--color-danger-hover: #bc2029;   /* red-700 */

/* Warning - GitHub Yellow */
--color-warning: #9A6700;        /* yellow-600 */
--color-warning-hover: #854d00;  /* yellow-700 */
```

### 背景与边框

```css
/* Backgrounds */
--bg-white: #FFFFFF;             /* 纯白 */
--bg-subtle: #F6F8FA;            /* slate-50, Header/Sidebar */
--bg-hover: #F3F4F6;             /* slate-100, Hover state */
--bg-selected: #ddf4ff;          /* GitHub选中色，批量选择 */

/* Borders */
--border-default: #D0D7DE;       /* slate-300, GitHub经典边框 */
--border-muted: #E5E7EB;         /* slate-200, 更柔和的边框 */

/* Text */
--text-primary: #1F2328;         /* slate-900, 主要文字 */
--text-secondary: #656D76;       /* slate-500, 次要文字 */
--text-muted: #9CA3AF;           /* slate-400, 辅助文字 */
```

### HTTP方法颜色映射

```css
POST:   #1F883D  /* GitHub Green - 创建 */
GET:    #0969DA  /* GitHub Blue - 读取 */
PUT:    #9A6700  /* GitHub Yellow - 更新 */
DELETE: #CF222E  /* GitHub Red - 删除 */
PATCH:  #9A6700  /* GitHub Yellow - 部分更新 */
```

---

## 字体系统

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
```

### Font Sizes

| 用途 | Tailwind Class | 实际尺寸 |
|------|---------------|---------|
| 标题 | `text-base` | 16px |
| 主要内容 | `text-sm` | 14px |
| 辅助文字 | `text-xs` | 12px |
| 模块标题 | `text-[11px]` | 11px |
| 超小文字 | `text-[10px]` | 10px |

### Font Weights

| 用途 | Tailwind Class | 实际重量 |
|------|---------------|---------|
| 粗体 | `font-bold` | 700 |
| 中粗 | `font-semibold` | 600 |
| 中等 | `font-medium` | 500 |
| 常规 | `font-normal` | 400 |

---

## 间距系统

### Padding

```css
p-2  (8px)   - Compact元素
p-3  (12px)  - 小卡片、工具栏
p-4  (16px)  - 标准卡片
p-6  (24px)  - 主内容区
```

### Gap

```css
gap-1 (4px)   - Tab按钮之间
gap-2 (8px)   - 图标与文字、按钮之间
gap-3 (12px)  - Header内元素、卡片内元素
gap-4 (16px)  - 主要区块
gap-5 (20px)  - 批量栏内元素
gap-6 (24px)  - Field Omission配置项
```

### Margin

```css
space-y-0.5  - API列表项（2px）
space-y-1    - 表单字段内部（4px）
space-y-3    - 表单字段之间（12px）
space-y-4    - 卡片之间（16px）
space-y-6    - 大区块之间（24px）
```

---

## 视觉样式

### 圆角

| 用途 | Tailwind Class | 实际尺寸 |
|------|---------------|---------|
| 标准 | `rounded-md` | 6px（GitHub标准） |
| 大型 | `rounded-lg` | 8px（Modal外框） |
| 微圆角 | `rounded-sm` | 2px（模块Header） |
| 全圆 | `rounded-full` | 9999px（Toggle/Pill/Badge） |

### 阴影

```css
shadow-sm   - 输入框、次要按钮
shadow-md   - 卡片hover
shadow-lg   - 主要按钮、Status Pill
shadow-xl   - 弹出菜单
shadow-2xl  - Modal容器
```

### Focus环（GitHub标志性设计）

```css
focus:border-[#0969DA]
focus:ring-2
focus:ring-[#0969DA]/30
focus:outline-none
```

**Focus环颜色变体**：
```css
/* Primary Focus（默认） */
focus:ring-[#0969DA]/30

/* Danger Focus（删除操作） */
focus:ring-[#CF222E]/30

/* Success Focus（应用按钮） */
focus:ring-[#1F883D]/30
```

---

## 微交互

### Transition时长

```css
duration-100 (100ms)  - Hover/Focus（极快反馈）
duration-200 (200ms)  - Toggle/Checkbox（看清状态）
duration-300 (300ms)  - Accordion/Pill（柔和展开）
```

### Hover效果

```css
/* 按钮Hover */
hover:em-bg-gray-100         /* 浅灰背景 */
hover:em-text-[#0969DA]      /* 文字变蓝 */

/* Danger按钮Hover */
hover:em-bg-[#FFEBE9]        /* 浅红背景 */
hover:em-text-[#CF222E]      /* 文字变红 */

/* Success按钮Hover */
hover:em-bg-[#dafbe1]        /* 浅绿背景 */
hover:em-text-[#1F883D]      /* 文字变绿 */
```

### 动画曲线

```css
ease-in-out  /* 大多数过渡 */
linear       /* Toggle开关、Checkbox */
ease-out     /* Hover放大效果 */
```

---

## 基础组件库

### 1. Primary Button

```html
<button class="
  em-px-4 em-py-1.5
  em-text-sm em-font-medium
  em-bg-[#1F883D]
  em-text-white
  em-border em-border-[#1F883D]
  em-rounded-md
  em-shadow-sm
  em-transition-colors em-duration-100
  hover:em-bg-[#1a7f37]
  focus:em-ring-2 focus:em-ring-[#0969DA] focus:em-ring-offset-1
  focus:em-outline-none
">
  Apply Changes
</button>
```

### 2. Secondary Button

```html
<button class="
  em-px-4 em-py-1.5
  em-text-sm em-font-medium
  em-bg-white
  em-text-[#1F2328]
  em-border em-border-[#D0D7DE]
  em-rounded-md
  em-shadow-sm
  em-transition-colors em-duration-100
  hover:em-bg-[#F6F8FA]
  focus:em-ring-2 focus:em-ring-[#0969DA]
  focus:em-outline-none
">
  Cancel
</button>
```

### 3. Danger Button

```html
<button class="
  em-px-3 em-py-1.5
  em-text-sm em-font-medium
  em-bg-[#CF222E]
  em-text-white
  em-rounded-md
  em-shadow-sm
  em-transition-colors em-duration-100
  hover:em-bg-[#bc2029]
  focus:em-ring-2 focus:em-ring-[#CF222E]/30
  focus:em-outline-none
">
  Delete
</button>
```

### 4. Icon Button

```html
<button class="
  em-p-1.5
  em-text-[#656D76]
  em-rounded-md
  em-transition-colors em-duration-100
  hover:em-bg-[#F6F8FA]
  hover:em-text-[#0969DA]
  focus:em-outline-none
  focus:em-ring-2 focus:em-ring-[#0969DA]/30
" aria-label="Settings">
  <svg class="em-w-4 em-h-4"><!-- Icon --></svg>
</button>
```

### 5. Text Input

```html
<input type="text" class="
  em-w-full
  em-px-3 em-py-1.5
  em-text-sm
  em-bg-white
  em-border em-border-[#D0D7DE]
  em-rounded-md
  em-shadow-sm
  em-transition-all
  placeholder:em-text-[#656D76]
  focus:em-border-[#0969DA]
  focus:em-ring-2 focus:em-ring-[#0969DA]/30
  focus:em-outline-none
">
```

### 6. Select Dropdown

```html
<div class="em-relative">
  <select class="
    em-w-full
    em-appearance-none
    em-px-3 em-py-1.5 em-pr-8
    em-text-sm
    em-bg-white
    em-border em-border-[#D0D7DE]
    em-rounded-md
    focus:em-border-[#0969DA]
    focus:em-ring-2 focus:em-ring-[#0969DA]/30
    focus:em-outline-none
  ">
    <option>Option 1</option>
  </select>
  <!-- Custom Arrow -->
  <svg class="em-pointer-events-none em-absolute em-right-2.5 em-top-2.5 em-h-3 em-w-3 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.72 5.22a.75.75 0 0 1 1.06 0L8 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 6.28a.75.75 0 0 1 0-1.06Z"/>
  </svg>
</div>
```

### 7. Range Slider

```html
<input type="range" class="
  em-w-full
  em-h-1.5
  em-cursor-pointer
  em-appearance-none
  em-rounded-lg
  em-bg-[#D0D7DE]
  em-accent-[#0969DA]
">
```

### 8. Checkbox

```html
<input type="checkbox" class="
  em-h-4 em-w-4
  em-text-[#0969DA]
  em-border-[#D0D7DE]
  em-rounded
  focus:em-ring-2 focus:em-ring-[#0969DA]/30
">
```

### 9. Toggle Switch（Pill样式）

```html
<label class="em-relative em-inline-flex em-h-6 em-w-11 em-shrink-0 em-cursor-pointer em-items-center em-rounded-full em-border-2 em-border-transparent em-bg-[#D0D7DE] em-transition-colors em-duration-200 focus-within:em-ring-2 focus-within:em-ring-[#0969DA] focus-within:em-ring-offset-2">
  <span class="em-sr-only">Enable</span>
  <input type="checkbox" class="em-peer em-sr-only">
  <span class="em-h-5 em-w-5 em-transform em-rounded-full em-bg-white em-shadow em-ring-0 em-transition em-duration-200 em-ease-in-out peer-checked:em-translate-x-5 peer-checked:em-bg-[#1F883D]"></span>
</label>
```

**状态说明**：
- Off: `bg-[#D0D7DE]`（灰色），圆圈在左
- On: `peer-checked:bg-[#1F883D]`（绿色），圆圈右移

### 10. Standard Card

```html
<div class="
  em-bg-white
  em-border em-border-[#D0D7DE]
  em-rounded-md
">
  <!-- Card Header -->
  <div class="
    em-px-4 em-py-2.5
    em-bg-[#F6F8FA]
    em-border-b em-border-[#D0D7DE]
    em-rounded-t-md
  ">
    <h3 class="em-text-xs em-font-semibold em-text-[#656D76] em-uppercase em-tracking-wide">
      Card Title
    </h3>
  </div>

  <!-- Card Body -->
  <div class="em-p-4">
    <!-- Content -->
  </div>
</div>
```

### 11. Info Card（成功提示）

```html
<div class="
  em-bg-green-50
  em-border em-border-green-200
  em-rounded-md
  em-p-4
">
  <div class="em-flex em-items-start em-gap-3">
    <svg class="em-w-5 em-h-5 em-text-green-600 em-flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    <div>
      <div class="em-text-sm em-font-medium em-text-green-900">
        提示标题
      </div>
      <div class="em-text-xs em-text-green-700 em-mt-1">
        提示内容
      </div>
    </div>
  </div>
</div>
```

### 12. Warning Card

```html
<div class="
  em-rounded-md
  em-border em-border-yellow-200
  em-bg-yellow-50
  em-p-4
">
  <div class="em-flex em-gap-3">
    <svg class="em-mt-0.5 em-h-4 em-w-4 em-shrink-0 em-text-[#9A6700]" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
    </svg>
    <div>
      <h4 class="em-text-sm em-font-bold em-text-[#9A6700]">警告标题</h4>
      <p class="em-mt-1 em-text-xs em-text-[#9A6700]">
        警告内容
      </p>
    </div>
  </div>
</div>
```

### 13. Error Card

```html
<div class="
  em-bg-red-50
  em-border em-border-red-200
  em-rounded-md
  em-p-4
">
  <div class="em-flex em-items-start em-gap-3">
    <svg class="em-w-5 em-h-5 em-text-red-600 em-flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
    <div>
      <div class="em-text-sm em-font-medium em-text-red-900">
        错误标题
      </div>
      <div class="em-text-xs em-text-red-700 em-mt-1">
        错误内容
      </div>
    </div>
  </div>
</div>
```

### 14. Accordion

```html
<details class="
  em-group
  em-rounded-md
  em-border em-border-[#D0D7DE]
  em-bg-white
  open:em-shadow-sm
">
  <summary class="
    em-flex
    em-cursor-pointer
    em-items-center
    em-justify-between
    em-bg-[#F6F8FA]
    em-px-4 em-py-2
    em-text-sm em-font-semibold em-text-[#1F2328]
    em-transition-colors em-duration-100
    hover:em-bg-gray-100
    focus:em-outline-none
    focus:em-ring-2 focus:em-ring-[#0969DA]
    group-open:em-rounded-t-md
    group-open:em-border-b group-open:em-border-[#D0D7DE]
  ">
    <span>Accordion Title</span>
    <!-- Chevron with rotation -->
    <svg class="
      em-h-5 em-w-5
      em-text-gray-500
      em-transition-transform
      group-open:em-rotate-180
    " fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </summary>

  <div class="em-p-4">
    <!-- Accordion Content -->
  </div>
</details>
```

### 15. Badge/Pill

```html
<!-- Count Badge (Blue) -->
<span class="
  em-flex em-h-5
  em-items-center em-justify-center
  em-rounded-full
  em-bg-[#0969DA]
  em-px-1.5
  em-text-[10px] em-font-bold em-text-white
">
  3
</span>

<!-- Status Badge (Gray) -->
<span class="
  em-rounded-full
  em-bg-[#D0D7DE]/50
  em-px-2 em-py-0.5
  em-text-[10px] em-font-semibold em-text-[#656D76]
">
  2 items
</span>
```

### 16. 状态指示器（圆点）

```html
<!-- Enabled (Green with pulse) -->
<span class="em-relative em-flex em-h-2.5 em-w-2.5 em-shrink-0">
  <span class="em-absolute em-inline-flex em-h-full em-w-full em-animate-ping em-rounded-full em-bg-[#1F883D] em-opacity-75"></span>
  <span class="em-relative em-inline-flex em-h-2.5 em-w-2.5 em-rounded-full em-bg-[#1F883D]"></span>
</span>

<!-- Disabled (Gray, no animation) -->
<span class="em-h-2 em-w-2 em-rounded-full em-bg-gray-300"></span>

<!-- Error (Red) -->
<span class="em-h-2 em-w-2 em-rounded-full em-bg-[#CF222E]"></span>
```

### 17. 分隔线

```html
<!-- 垂直分隔线 -->
<div class="em-h-5 em-w-px em-bg-[#D0D7DE]"></div>

<!-- 水平分隔线 -->
<hr class="em-border-[#D0D7DE]">
```

---

## 状态与反馈组件

### 18. 禁用状态

**应用场景**: 当规则被禁用、表单未填写完整或用户无权限操作时。

```html
<!-- Disabled Button -->
<button class="
  em-px-4 em-py-1.5
  em-text-sm em-font-medium
  em-bg-[#F6F8FA]
  em-text-[#9CA3AF]
  em-border em-border-[#D0D7DE]
  em-rounded-md
  em-opacity-50
  em-cursor-not-allowed
" disabled>
  Apply Changes
</button>

<!-- Disabled Input -->
<input type="text" class="
  em-w-full
  em-px-3 em-py-1.5
  em-text-sm
  em-bg-[#F6F8FA]
  em-text-[#9CA3AF]
  em-border em-border-[#D0D7DE]
  em-rounded-md
  em-cursor-not-allowed
  em-opacity-50
" disabled>

<!-- Disabled Select -->
<select class="
  em-w-full
  em-appearance-none
  em-px-3 em-py-1.5
  em-text-sm
  em-bg-[#F6F8FA]
  em-text-[#9CA3AF]
  em-border em-border-[#D0D7DE]
  em-rounded-md
  em-cursor-not-allowed
  em-opacity-50
" disabled>
  <option>Option 1</option>
</select>
```

**关键样式**:
- `opacity-50` - 半透明效果
- `cursor-not-allowed` - 禁用光标
- `bg-[#F6F8FA]` - 灰色背景
- `text-[#9CA3AF]` - 淡化文字
- 移除所有 `hover:` 和 `focus:` 效果

### 19. 加载状态

**应用场景**: 点击"Apply Changes"后的异步操作反馈。

```html
<!-- Loading Button (Primary with Spinner) -->
<button class="
  em-flex em-items-center em-gap-2
  em-px-4 em-py-1.5
  em-text-sm em-font-medium
  em-bg-[#1F883D]
  em-text-white
  em-border em-border-[#1F883D]
  em-rounded-md
  em-cursor-wait
  em-opacity-75
" disabled>
  <!-- GitHub-style Spinner -->
  <svg class="em-animate-spin em-h-4 em-w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="em-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="em-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
  <span>Applying...</span>
</button>

<!-- Inline Spinner (for content loading) -->
<div class="em-flex em-items-center em-justify-center em-p-8">
  <svg class="em-animate-spin em-h-6 em-w-6 em-text-[#656D76]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="em-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="em-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
</div>
```

**关键样式**:
- `animate-spin` - Tailwind内置旋转动画
- `cursor-wait` - 等待光标
- `opacity-75` - 略微淡化
- Spinner颜色: `text-[#656D76]`（灰色）或 `currentColor`（继承）

### 20. 空状态

**应用场景**: Sidebar过滤无结果、插件首次启动无请求、无规则配置时。

```html
<!-- Empty State (No Results) -->
<div class="em-flex em-flex-col em-items-center em-justify-center em-p-8 em-text-center">
  <!-- Icon (GitHub Octicon: search-16) -->
  <svg class="em-h-8 em-w-8 em-text-[#D0D7DE] em-mb-3" viewBox="0 0 16 16" fill="currentColor">
    <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-8.997.01A4.5 4.5 0 0 0 11.5 7Z"/>
  </svg>

  <h3 class="em-text-sm em-font-bold em-text-[#1F2328] em-mb-1">
    No requests found
  </h3>

  <p class="em-text-xs em-text-[#656D76]">
    Trigger some network traffic to see requests here.
  </p>
</div>

<!-- Empty State (No Rules) -->
<div class="em-flex em-flex-col em-items-center em-justify-center em-p-8 em-text-center">
  <!-- Icon (GitHub Octicon: beaker-16) -->
  <svg class="em-h-8 em-w-8 em-text-[#D0D7DE] em-mb-3" viewBox="0 0 16 16" fill="currentColor">
    <path d="M5 2.75C5 2.34 5.34 2 5.75 2h4.5c.41 0 .75.34.75.75v5.19l3.74 6.65c.18.32-.04.72-.4.72H1.41c-.36 0-.58-.4-.4-.72L5 7.94ZM7.5 3.5h-1v4.06l-1.39 2.44h5.78L9.5 7.56V3.5h-1v4a.75.75 0 0 1-1.5 0Z"/>
  </svg>

  <h3 class="em-text-sm em-font-bold em-text-[#1F2328] em-mb-1">
    No mock rules yet
  </h3>

  <p class="em-text-xs em-text-[#656D76]">
    Select an API from the sidebar to create your first mock.
  </p>
</div>
```

**关键样式**:
- 图标颜色: `text-[#D0D7DE]`（浅灰）
- 标题: `text-sm font-bold text-[#1F2328]`
- 描述: `text-xs text-[#656D76]`
- 居中布局: `flex flex-col items-center justify-center`
- Padding: `p-8`（32px，充足呼吸感）

### 21. 内联表单验证

**应用场景**: 实时表单字段验证（正则表达式、数字范围、必填项等）。

```html
<!-- Error Input State -->
<div class="em-space-y-1">
  <label class="em-block em-text-sm em-font-medium em-text-[#1F2328]">
    URL Pattern
  </label>

  <input type="text" value="[invalid regex" class="
    em-w-full
    em-px-3 em-py-1.5
    em-text-sm
    em-bg-white
    em-border-2 em-border-[#CF222E]
    em-rounded-md
    em-shadow-sm
    em-transition-all
    placeholder:em-text-[#656D76]
    focus:em-border-[#CF222E]
    focus:em-ring-2 focus:em-ring-[#CF222E]/30
    focus:em-outline-none
  ">

  <!-- Error Message -->
  <p class="em-flex em-items-center em-gap-1 em-mt-1 em-text-xs em-text-[#CF222E]">
    <!-- Error Icon (GitHub Octicon: alert-16) -->
    <svg class="em-h-3 em-w-3 em-shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
    </svg>
    <span>Invalid regular expression: Unclosed character class</span>
  </p>
</div>

<!-- Success Input State (Optional) -->
<div class="em-space-y-1">
  <label class="em-block em-text-sm em-font-medium em-text-[#1F2328]">
    Delay (ms)
  </label>

  <input type="number" value="200" class="
    em-w-full
    em-px-3 em-py-1.5
    em-text-sm
    em-bg-white
    em-border-2 em-border-[#1F883D]
    em-rounded-md
    em-shadow-sm
    focus:em-border-[#1F883D]
    focus:em-ring-2 focus:em-ring-[#1F883D]/30
    focus:em-outline-none
  ">

  <!-- Success Message -->
  <p class="em-flex em-items-center em-gap-1 em-mt-1 em-text-xs em-text-[#1F883D]">
    <!-- Check Icon -->
    <svg class="em-h-3 em-w-3 em-shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
    </svg>
    <span>Valid input</span>
  </p>
</div>
```

**关键样式**:
- **错误状态**:
  - 边框: `border-2 border-[#CF222E]`（2px红色）
  - Focus环: `focus:ring-[#CF222E]/30`
  - 错误文字: `text-[#CF222E]`
  - 图标: Alert triangle（3x3px）

- **成功状态**（可选）:
  - 边框: `border-2 border-[#1F883D]`（2px绿色）
  - Focus环: `focus:ring-[#1F883D]/30`
  - 成功文字: `text-[#1F883D]`
  - 图标: Check mark（3x3px）

**验证时机**:
- `onBlur` - 失去焦点时验证
- `onChange` - 实时验证（debounce 300ms）
- 提交前最终验证

---

## 可访问性规范

### 必须遵守的ARIA

**Tab组件**：
```html
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
</div>
<div role="tabpanel">Content</div>
```

**Toggle Switch**：
```html
<button role="switch" aria-checked="true">
  <span class="em-sr-only">Enable Mock</span>
</button>
```

**Status Indicators**：
```html
<span aria-label="Enabled">
  <!-- Visual dot -->
</span>
```

**Icon Buttons**：
```html
<button aria-label="Close">
  <svg><!-- Icon --></svg>
</button>
```

### 颜色对比度要求

| 场景 | 前景色 | 背景色 | 对比度 | 标准 |
|------|--------|--------|--------|------|
| 主要文字 | #1F2328 | #FFFFFF | 16:1 | ✅ AAA |
| 次要文字 | #656D76 | #FFFFFF | 7.2:1 | ✅ AAA |
| Primary按钮 | #FFFFFF | #1F883D | 4.9:1 | ✅ AA |
| Danger按钮 | #FFFFFF | #CF222E | 4.7:1 | ✅ AA |

### 键盘导航

**必须支持的快捷键**：
- `Tab` / `Shift+Tab` - 焦点切换
- `Enter` / `Space` - 激活按钮
- `Escape` - 关闭Modal/清空选择
- `⌘K` / `Ctrl+K` - 聚焦搜索
- `⌘S` / `Ctrl+S` - 快速保存
- `⌘A` / `Ctrl+A` - 全选（Sidebar焦点时）
- `Ctrl+Click` - 多选
- `Shift+Click` - 范围选择

---

## GitHub Octicons图标

### 常用图标SVG路径

**Chevron Right**（用于模块折叠）:
```html
<svg viewBox="0 0 16 16" fill="currentColor">
  <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
</svg>
```

**Chevron Down**（用于下拉框）:
```html
<svg viewBox="0 0 16 16" fill="currentColor">
  <path d="M3.72 5.22a.75.75 0 0 1 1.06 0L8 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 6.28a.75.75 0 0 1 0-1.06Z"/>
</svg>
```

**Stack**（批量图标）:
```html
<svg viewBox="0 0 16 16" fill="currentColor">
  <path d="M7.75 12.5a.75.75 0 0 1 .75.75V15h3a.75.75 0 0 1 0-1.5H9.25a.75.75 0 0 1 0-1.5h3.25a1.5 1.5 0 0 1 1.5 1.5v2.25a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75V13.5a1.5 1.5 0 0 1 1.5-1.5h3.25a.75.75 0 0 1 0 1.5H5.5a.75.75 0 0 1 0 1.5h3v-1.75a.75.75 0 0 1-.25-.75ZM2.75 4a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75ZM1 8.75A.75.75 0 0 1 1.75 8h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8.75Z" />
</svg>
```

**Check Circle**（启用图标）:
```html
<svg viewBox="0 0 16 16" fill="currentColor">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm3.78-9.72a.751.751 0 0 1 .018 1.042l-2.363 2.904a.909.909 0 0 1-1.356.042L5.47 7.72a.75.75 0 0 1 1.06-1.06l1.969 1.969 1.74-2.148a.75.75 0 0 1 1.54.24Z"/>
</svg>
```

**Circle Slash**（禁用图标）:
```html
<svg viewBox="0 0 16 16" fill="currentColor">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Z"/>
</svg>
```

**Trash**（删除图标）:
```html
<svg viewBox="0 0 16 16" fill="currentColor">
  <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
</svg>
```

---

## 设计原则

1. **Boxy布局** - 用边框界定区域，而非背景色
2. **高对比度、低饱和度** - 色彩仅用于状态
3. **微妙现代感** - Header微模糊、轻微阴影
4. **极快反馈** - 100ms过渡
5. **渐进式披露** - 核心可见，高级折叠
6. **信息密度平衡** - 紧凑但不拥挤
7. **无过度设计** - 简约专业

---

**参考资源**：
- GitHub Primer: https://primer.style/
- Tailwind CSS: https://tailwindcss.com/
