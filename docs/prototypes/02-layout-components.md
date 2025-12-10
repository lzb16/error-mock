# 布局与核心组件

> **文档说明**: 本文档整合所有布局和核心UI组件设计，提取自archived设计文档
> **HTML原型总数**: 18个完整代码块
> **设计来源**: Gemini (Google AI) + Claude协作设计
> **最后更新**: 2025-12-10

---

## 第1章：Modal框架

### 1.1 整体布局结构

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER (h-14, bg-slate-50, border-b-slate-200)                     │
│ Error Mock     🔍 Search (⌘K)    [Mock Type▼] [Enable●] [-] [×]   │
├─────────────────┬──────────────────────────────────────────────────┤
│                 │ TAB NAV (h-12, bg-white, border-b-slate-200)     │
│ SIDEBAR         │ [Network] [Response] [Advanced]                  │
│ (w-64)          ├──────────────────────────────────────────────────┤
│ bg-slate-50     │ TAB CONTENT (flex-1, overflow-y-auto, p-6)       │
│ border-r        │                                                  │
│                 │ ┌─ Network Simulation ──────────────────────┐   │
│ 🔍 Filter API   │ │                                            │   │
│                 │ │ Delay:      [200] ms                       │   │
│ 📂 user (2)     │ │ Fail Rate:  [─────●──] 0.3                 │   │
│  ● POST /login  │ │                                            │   │
│    Active       │ │ □ Timeout   □ Offline                      │   │
│  ○ GET /profile │ └────────────────────────────────────────────┘   │
│                 │                                                  │
│ 📂 storage (1)  │ ┌─ Quick Presets ───────────────────────────┐   │
│  ○ POST /save   │ │ [慢速网络] [超时错误] [离线模拟]           │   │
│                 │ └────────────────────────────────────────────┘   │
│ ────────────    │                                                  │
│ [⚙️ Settings]   │                                                  │
└─────────────────┴──────────────────────────────────────────────────┘
│ FOOTER (h-14, bg-slate-50, border-t-slate-200) - 仅Dirty State显示 │
│ ⚠️ Unsaved changes                            [Cancel] [Apply]     │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 尺寸规格

| 区域 | 尺寸 | 说明 |
|------|------|------|
| **Modal Container** | `w-[90vw] max-w-6xl h-[85vh]` | 占据90%视窗宽度，最大6xl，高度85% |
| **Header** | `h-14` (56px) | 固定高度 |
| **Sidebar** | `w-64` (256px) | 固定宽度 |
| **Tab Navigation** | `h-12` (48px) | 固定高度 |
| **Footer** | `h-14` (56px) | 固定高度，条件显示 |
| **Tab Content** | `flex-1` | 自适应剩余空间，独立滚动 |

### 1.3 Z-Index层级

```
┌─ z-[9999] Modal Background Overlay
│  └─ z-[9999] Modal Container
│     ├─ z-10 Header
│     ├─ z-10 Sidebar
│     ├─ z-10 Tab Nav
│     ├─ z-0 Tab Content
│     └─ z-10 Footer
```

### 1.4 关键技术点

```css
/* Modal Container */
.modal {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 阻止整体滚动 */
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden; /* 阻止水平滚动 */
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar nav {
  flex: 1;
  overflow-y: auto; /* 独立滚动 */
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tab-content {
  flex: 1;
  overflow-y: auto; /* 独立滚动 */
}
```

---

## 第2章：Header组件

### 2.1 设计原则（Gemini第七轮）

**Header的新职责：纯上下文框架**

Header严格回答："我在使用什么工具？在查看什么？"

Header不回答："我能做什么？"（这是Tab Content控制栏的职责）

**Gemini评价**：
> "Controls should be adjacent to the object they modify. If I am editing the properties of `/api/login`, the 'Enable' switch is a property of that API. It belongs in the **Property Editor (Tab Content)**, not the Window Title Bar."

### 2.2 单选模式Header

**HTML原型（完整代码）**：

```html
<!-- HEADER (Single Mode State) -->
<header class="em-flex em-h-14 em-shrink-0 em-items-center em-justify-between em-border-b em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-4">

  <!-- Left: App Title -->
  <div class="em-flex em-items-center em-gap-3">
    <span class="em-font-bold em-text-[#1F2328]">Error Mock</span>
    <div class="em-h-5 em-w-px em-bg-[#D0D7DE]"></div>
  </div>

  <!-- Center: API Context -->
  <div class="em-flex em-flex-1 em-items-baseline em-gap-2 em-px-4 em-text-sm em-min-w-0" title="POST /api/user/login">
     <!-- Method (Color changes based on method) -->
     <span class="em-font-mono em-font-bold em-text-[#1F883D] em-shrink-0">POST</span>
     <!-- Path (Truncated) -->
     <span class="em-truncate em-max-w-[300px] em-text-[#1F2328] em-font-medium">
       /api/user/login
     </span>
  </div>

  <!-- Right: Window Controls Only -->
  <div class="em-flex em-items-center em-gap-2">
    <!-- Minimize -->
    <button class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#D0D7DE]/50 hover:em-text-[#0969DA] focus:em-outline-none" aria-label="Minimize">
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z" /></svg>
    </button>
    <!-- Close -->
    <button class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#FFEBE9] hover:em-text-[#CF222E] focus:em-outline-none" aria-label="Close">
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" /></svg>
    </button>
  </div>
</header>
```

**设计要点**：
- **三段式布局**：Title | API Context | Window Controls
- **API路径可放宽至300px**（因为控制已移除）
- **Hover效果**：Minimize变蓝色，Close变红色
- **Tooltip**：完整路径显示在title属性

### 2.3 批量模式Header

**HTML原型（完整代码）**：

```html
<!-- HEADER (Batch Mode State) -->
<!-- Simplified state to reduce cognitive load during batch operations -->
<header class="em-flex em-h-14 em-shrink-0 em-items-center em-justify-between em-border-b em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-4">

  <!-- Left: Context (Fixed Title Only) -->
  <div class="em-flex em-items-center em-gap-3">
    <span class="em-font-bold em-text-[#1F2328]">Error Mock</span>
    <div class="em-h-5 em-w-px em-bg-[#D0D7DE]"></div>
  </div>

  <!-- Center: Batch Context (显示批量状态) -->
  <div class="em-flex em-flex-1 em-items-center em-gap-2 em-px-4 em-text-sm em-min-w-0">
     <!-- Batch Icon (Stack icon) -->
     <svg class="em-h-4 em-w-4 em-text-[#0969DA] em-shrink-0" viewBox="0 0 16 16" fill="currentColor">
       <path d="M7.75 12.5a.75.75 0 0 1 .75.75V15h3a.75.75 0 0 1 0-1.5H9.25a.75.75 0 0 1 0-1.5h3.25a1.5 1.5 0 0 1 1.5 1.5v2.25a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75V13.5a1.5 1.5 0 0 1 1.5-1.5h3.25a.75.75 0 0 1 0 1.5H5.5a.75.75 0 0 1 0 1.5h3v-1.75a.75.75 0 0 1-.25-.75ZM2.75 4a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75ZM1 8.75A.75.75 0 0 1 1.75 8h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8.75Z" />
     </svg>
     <!-- Text -->
     <span class="em-font-medium em-text-[#1F2328]">
       Batch Editing <span class="em-font-bold em-text-[#0969DA]">3 items</span>
     </span>
  </div>

  <!-- Right: Window Controls Only -->
  <div class="em-flex em-items-center em-gap-2">
    <!-- Minimize -->
    <button
      class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#D0D7DE]/50 hover:em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none"
      aria-label="Minimize"
    >
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z" />
        </svg>
    </button>

    <!-- Close -->
    <button
      class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#FFEBE9] hover:em-text-[#CF222E] focus:em-ring-2 focus:em-ring-[#CF222E]/40 focus:em-outline-none"
      aria-label="Close"
    >
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
  </div>
</header>
```

**批量模式特点**：
- **📦 图标** + "Batch Editing **N** items"
- **数字用蓝色加粗**（text-[#0969DA] font-bold）
- **为什么不留空白**：Gemini评价"空白中间区域看起来像坏了"
- **为什么不显示第一个API**：危险，暗示只编辑第一个

### 2.4 HTTP方法颜色映射

| 方法 | Tailwind Class | 颜色值 | 说明 |
|------|---------------|--------|------|
| POST | `em-text-[#1F883D]` | GitHub Green | 创建资源 |
| GET | `em-text-[#0969DA]` | GitHub Blue | 读取资源 |
| PUT | `em-text-[#9A6700]` | GitHub Yellow | 更新资源 |
| DELETE | `em-text-[#CF222E]` | GitHub Red | 删除资源 |
| PATCH | `em-text-[#9A6700]` | GitHub Yellow | 部分更新 |

---

## 第3章：Sidebar组件

### 3.1 顶部：Filter / 批量工具栏（条件切换）

#### 模式1：Filter输入框（selectedCount === 0）

**HTML原型**：

```html
<div class="em-border-b em-border-[#D0D7DE] em-bg-white em-p-3">
  <div class="em-relative">
    <div class="em-absolute em-inset-y-0 em-left-0 em-flex em-items-center em-pl-2 em-pointer-events-none">
      <svg class="em-h-3.5 em-w-3.5 em-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input type="text" placeholder="Filter API... (⌘K)" class="em-w-full em-rounded em-border em-border-[#D0D7DE] em-bg-white em-px-2 em-py-1.5 em-pl-8 em-text-xs focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none">
  </div>
</div>
```

**功能（从Header Search迁移的智能功能）**：
- 拼音首字母支持（`yh` → `user`）
- 方法缩写（`g` → `GET`）
- 智能排序（精确 > 前缀 > 包含）
- 最近使用优先
- **快捷键**：⌘K / Ctrl+K 聚焦此输入框

#### 模式2：批量操作工具栏（selectedCount > 0）

**HTML原型**：

```html
<div class="em-border-b em-border-[#D0D7DE] em-bg-white em-p-3">
  <!-- 条件渲染：当 selectedCount > 0 时显示 -->
  <div class="em-flex em-items-center em-justify-between em-animate-in em-fade-in em-slide-in-from-top-1">

    <!-- Count & Clear -->
    <div class="em-flex em-items-center em-gap-2">
      <!-- Count Badge (Blue pill) -->
      <span class="em-flex em-h-5 em-items-center em-justify-center em-rounded-full em-bg-[#0969DA] em-px-1.5 em-text-[10px] em-font-bold em-text-white">
        3
      </span>
      <!-- Clear Button -->
      <button class="em-text-xs em-text-[#0969DA] hover:em-underline">
        Clear
      </button>
    </div>

    <!-- Actions -->
    <div class="em-flex em-gap-1">

      <!-- Enable Selected (Green) -->
      <button
        class="em-rounded-md em-p-1.5 em-text-[#1F883D] hover:em-bg-[#dafbe1]"
        title="Enable Selected"
        aria-label="Enable selected mocks"
      >
        <!-- GitHub Octicon: check-circle-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm3.78-9.72a.751.751 0 0 1 .018 1.042l-2.363 2.904a.909.909 0 0 1-1.356.042L5.47 7.72a.75.75 0 0 1 1.06-1.06l1.969 1.969 1.74-2.148a.75.75 0 0 1 1.54.24Z"/>
        </svg>
      </button>

      <!-- Disable Selected (Gray) -->
      <button
        class="em-rounded-md em-p-1.5 em-text-[#656D76] hover:em-bg-[#F3F4F6]"
        title="Disable Selected"
        aria-label="Disable selected mocks"
      >
        <!-- GitHub Octicon: circle-slash-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Z"/>
        </svg>
      </button>

      <!-- Delete Rules (Red) -->
      <button
        class="em-rounded-md em-p-1.5 em-text-[#CF222E] hover:em-bg-[#FFEBE9]"
        title="Delete Rules"
        aria-label="Delete selected rules"
      >
        <!-- GitHub Octicon: trash-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
        </svg>
      </button>

    </div>
  </div>
</div>
```

**批量操作按钮说明**：

| 按钮 | 图标 | 颜色 | Hover背景 | 操作 |
|------|------|------|----------|------|
| **Enable** | ✓ Check Circle | Green `#1F883D` | `bg-[#dafbe1]` | 批量启用选中的Mock |
| **Disable** | − Circle Slash | Gray `#656D76` | `bg-[#F3F4F6]` | 批量禁用选中的Mock |
| **Delete** | 🗑 Trash | Red `#CF222E` | `bg-[#FFEBE9]` | 批量删除选中的规则 |

### 3.2 中间：API列表

#### 模块折叠Header（GitHub文件树风格）

**HTML原型**：

```html
<!-- MODULE GROUP COMPONENT -->
<div class="em-mb-1">

  <!-- Header: Hover gray, cursor pointer -->
  <button
    class="em-group em-flex em-w-full em-items-center em-rounded-sm em-px-2 em-py-1.5 em-text-left hover:em-bg-[#D0D7DE]/30 focus:em-bg-[#D0D7DE]/30 focus:em-outline-none"
    aria-expanded="true"
    aria-controls="module-list-user"
  >

    <!-- Chevron: Rotates 90deg -->
    <svg
      class="em-mr-2 em-h-3 em-w-3 em-text-[#656D76] em-transition-transform em-duration-200 em-rotate-90"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <!-- GitHub Octicon: chevron-right-16 -->
      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
    </svg>

    <!-- Label: Uppercase, small, bold -->
    <span class="em-text-[11px] em-font-bold em-uppercase em-tracking-wider em-text-[#656D76]">
      User Module
    </span>

    <!-- Counter Badge: Pill style -->
    <span class="em-ml-auto em-rounded-full em-bg-[#D0D7DE]/50 em-px-2 em-py-0.5 em-text-[10px] em-font-semibold em-text-[#656D76]">
      2
    </span>
  </button>

  <!-- Content List (Conditional) -->
  <div id="module-list-user" class="em-mt-0.5 em-space-y-0.5">
    <!-- API Items go here -->
  </div>
</div>
```

#### API项目 - 单选状态（isViewed）

**HTML原型**：

```html
<!-- Active/Viewed Item (Blue Bar + White BG) -->
<div class="em-group em-flex em-w-full em-items-center em-border-l-4 em-border-[#0969DA] em-bg-white em-py-2 em-pl-3 em-pr-2 em-cursor-pointer hover:em-bg-gray-100">
  <div class="em-flex em-w-full em-items-center em-justify-between">
    <div class="em-flex em-flex-col">
      <span class="em-text-xs em-font-bold em-text-[#1F883D]">POST</span>
      <span class="em-truncate em-text-xs em-font-semibold em-text-[#1F2328]">/api/user/login</span>
    </div>
    <span class="em-h-2 em-w-2 em-rounded-full em-bg-[#1F883D]" aria-label="Enabled"></span>
  </div>
</div>
```

#### API项目 - 批量选中状态（isSelected）

**HTML原型**：

```html
<!-- Selected Item (Checkbox + Light Blue BG) -->
<div class="em-group em-relative em-flex em-cursor-pointer em-items-center em-py-2 em-pl-3 em-pr-2 em-transition-colors em-border-l-4 em-border-transparent !em-bg-[#ddf4ff]">

  <!-- Checkbox: Always visible when selected -->
  <div class="em-mr-2 em-flex em-h-4 em-w-4 em-shrink-0 em-items-center em-justify-center">
    <input
      type="checkbox"
      checked
      class="em-h-3.5 em-w-3.5 em-cursor-pointer em-rounded-sm em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 em-block"
    />
  </div>

  <!-- Content Container -->
  <div class="em-flex em-min-w-0 em-flex-1 em-items-center em-justify-between">
    <div class="em-flex em-flex-col em-truncate">
      <span class="em-text-[10px] em-font-bold em-text-[#0969DA]">GET</span>
      <span class="em-truncate em-text-xs em-text-[#1F2328]">/api/user/profile</span>
    </div>
    <span class="em-ml-2 em-h-2 em-w-2 em-shrink-0 em-rounded-full em-bg-gray-300"></span>
  </div>
</div>
```

#### API项目 - 双重状态（isViewed + isSelected）

**HTML原型**：

```html
<!-- Viewed AND Selected (Blue Bar + Light Blue BG + Checkbox) -->
<div class="em-group em-relative em-flex em-cursor-pointer em-items-center em-py-2 em-pl-3 em-pr-2 em-transition-colors em-border-l-4 em-border-[#0969DA] !em-bg-[#ddf4ff]">

  <!-- Checkbox -->
  <div class="em-mr-2 em-flex em-h-4 em-w-4 em-shrink-0 em-items-center em-justify-center">
    <input
      type="checkbox"
      checked
      class="em-h-3.5 em-w-3.5 em-cursor-pointer em-rounded-sm em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 em-block"
    />
  </div>

  <!-- Content -->
  <div class="em-flex em-min-w-0 em-flex-1 em-items-center em-justify-between">
    <div class="em-flex em-flex-col em-truncate">
      <span class="em-text-[10px] em-font-bold em-text-[#CF222E]">DELETE</span>
      <span class="em-truncate em-text-xs em-font-semibold em-text-[#1F2328]">/api/user/delete</span>
    </div>
    <span class="em-ml-2 em-h-2 em-w-2 em-shrink-0 em-rounded-full em-bg-[#1F883D]"></span>
  </div>
</div>
```

**双重状态规则**：

| isViewed | isSelected | 左侧蓝条 | 背景色 | Checkbox |
|----------|-----------|---------|-------|----------|
| ✅ | ❌ | 蓝色 | 白色 | 隐藏/Hover显示 |
| ❌ | ✅ | 透明 | 浅蓝色 | 显示 |
| ✅ | ✅ | 蓝色 | 浅蓝色 | 显示 |
| ❌ | ❌ | 透明 | 透明 | 隐藏/Hover显示 |

### 3.3 底部：全局状态栏（Gemini第三轮设计）

**HTML原型**：

```html
<!-- Global Status Bar & Settings (Gemini v3 Design) -->
<!-- Always visible. No z-index issues. No hover requirements. -->
<div class="em-border-t em-border-[#D0D7DE] em-bg-white em-p-3">

  <!-- Status Row -->
  <div class="em-flex em-items-center em-justify-between em-gap-2">

    <!-- Status Indicator -->
    <div class="em-flex em-items-center em-gap-2 em-overflow-hidden" title="3 rules are currently active">
      <!-- Pulse Animation for 'Active' state -->
      <span class="em-relative em-flex em-h-2.5 em-w-2.5 em-shrink-0">
        <span class="em-absolute em-inline-flex em-h-full em-w-full em-animate-ping em-rounded-full em-bg-[#1F883D] em-opacity-75"></span>
        <span class="em-relative em-inline-flex em-h-2.5 em-w-2.5 em-rounded-full em-bg-[#1F883D]"></span>
      </span>
      <span class="em-text-sm em-font-semibold em-text-[#1F2328] em-truncate">
        3 Active
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="em-flex em-items-center">
      <!-- Pause All (Danger Style) -->
      <button
        class="em-group em-rounded-md em-p-1.5 em-text-[#656D76] hover:em-bg-[#FFEBE9] hover:em-text-[#CF222E] focus:em-ring-2 focus:em-ring-[#CF222E]/40 focus:em-outline-none"
        title="Pause All Mocks"
        aria-label="Pause All Mocks"
      >
        <svg class="em-h-4 em-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <!-- Settings -->
      <button
        class="em-ml-1 em-rounded-md em-p-1.5 em-text-[#656D76] hover:em-bg-[#F3F4F6] hover:em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/40 focus:em-outline-none"
        title="Global Settings"
        aria-label="Global Settings"
      >
        <svg class="em-h-4 em-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  </div>
</div>
```

**设计优势（Gemini评价）**：
- ✅ 始终可见，无需Hover
- ✅ 零z-index冲突
- ✅ 符合VS Code/Slack的IDE模式
- ✅ 可访问性高（键盘Tab流程自然）
- ✅ 脉冲动画吸引注意

---

## 第4章：Footer组件

### 4.1 单选模式Footer

**HTML原型**：

```html
<!-- Footer (Conditional - only shown when dirty state) -->
<footer class="em-border-t em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-6 em-py-3 em-flex em-justify-end em-gap-3">
   <!-- Left: Warning -->
   <span class="em-mr-auto em-text-xs em-text-amber-600 em-flex em-items-center em-gap-1">
      <!-- Warning Icon -->
      <svg class="em-w-3 em-h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      Unsaved changes
   </span>

   <!-- Right: Actions -->
   <button class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-[#1F2328] hover:em-bg-gray-100 focus:em-ring-2 focus:em-ring-[#0969DA]">
     Cancel
   </button>

   <button class="em-rounded-md em-bg-[#1F883D] em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-white hover:em-bg-[#1a7f37] focus:em-ring-2 focus:em-ring-[#0969DA] focus:em-ring-offset-1">
     Apply Changes
   </button>
</footer>
```

### 4.2 批量模式Footer

**HTML原型**：

```html
<!-- FOOTER (Batch Mode) -->
<footer class="em-flex em-h-14 em-shrink-0 em-items-center em-justify-between em-border-t em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-6">

  <!-- Left: Status Info -->
  <div class="em-flex em-items-center em-gap-2">
    <span class="em-h-2 em-w-2 em-rounded-full em-bg-[#0969DA]"></span>
    <span class="em-text-xs em-font-medium em-text-[#656D76]">
      Pending changes for 3 items...
    </span>
  </div>

  <!-- Right: Actions -->
  <div class="em-flex em-gap-2">
    <!-- Cancel -->
    <button class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-[#1F2328] em-shadow-sm hover:em-bg-[#F3F4F6] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none">
      Cancel
    </button>

    <!-- Apply to Batch -->
    <button class="em-rounded-md em-bg-[#0969DA] em-px-4 em-py-1.5 em-text-sm em-font-bold em-text-white em-shadow-sm hover:em-bg-[#0860CA] focus:em-ring-2 focus:em-ring-[#0969DA]/40 focus:em-outline-none">
      Apply to 3 Selected
    </button>
  </div>
</footer>
```

**关键变化**：
- 按钮文字：`"Apply Changes"` → `"Apply to {selectedCount} Selected"`
- 状态提示：`"Pending changes for {selectedCount} items..."`

### 4.3 显示逻辑（Gemini建议）

**Gemini专家意见**：
> "这是网络拦截器。如果用户正在输入正则表达式或修改状态码，而此时App正在轮询API，自动保存到一半可能会破坏App或导致意外的网络错误。显式提交（Explicit commitment）对开发工具更安全。"

**最终决定**：
- ✅ 保留Footer条件显示（`hasUnsavedChanges && !isSettingsView`）
- ✅ 保留Apply/Cancel按钮
- ✅ 增强：支持⌘+S / Ctrl+S快捷键保存
- ❌ 不实施自动保存

---

## 第5章：FloatButton组件（侧边标签）

### 5.1 设计理念（Gemini第九轮设计）

**核心概念**："侧边停靠坞 (Docked Side Tab)"

**设计特性**：
- 不再是"悬浮的圆形按钮"，而是"浏览器边缘的延伸"
- 白底+边框，像浏览器原生UI一部分
- 侧边吸附（左右自动吸附，上下自由拖拽）
- Hover展开快捷操作

**触发**: 用户反馈"蓝色圆形太突兀，图标太大"

### 5.2 吸附行为

**拖拽逻辑**：
- **左右方向**：拖拽释放后自动吸附到最近的侧边（left: 0 或 right: 0）
- **上下方向**：自由拖拽，持久化y坐标
- **持久化格式**：`{ side: 'left' | 'right', y: number }`

**参考案例**：Chrome扩展侧边栏、客服聊天插件、Linear侧边工具

### 5.3 视觉规格（最终版 - 经Gemini+Codex审核）

**尺寸**（Gemini推荐）：
- 默认：`h-11 w-12`（44px高 x 48px宽）
- Hover拉伸：`w-auto`（约200px）
- 圆角：`rounded-l-2xl`（16px）

**图标包裹**：
- 7x7圆形容器（`h-7 w-7 rounded-full`）
- 图标尺寸：4x4（16px）- GitHub Octicon标准尺寸
- 背景闪烁动画（Active状态）

**状态颜色系统**：
- Idle: 灰色背景（`bg-[#F6F8FA]`）+ 灰色图标 - **静止**
- Active: 绿色背景（`bg-[#DAFBE1]`）+ 绿色图标 - **闪烁**
- Paused: 黄色背景（`bg-[#FFF8C5]`）+ 黄色图标 - **静止**

### 5.4 状态指示

| 状态 | 圆形容器 | 图标颜色 | 侧边条 | 背景动画 | Hover拉伸 |
|------|---------|---------|--------|---------|----------|
| **Idle** | 灰色 `#F6F8FA` | `#656D76` | ❌ 无 | ❌ 静止 | ❌ 不拉伸 |
| **Active** | 绿色 `#DAFBE1` | `#1F883D` | ✅ 绿色3px | ✅ **闪烁** | ✅ 拉伸 |
| **Paused** | 黄色 `#FFF8C5` | `#9A6700` | ✅ 黄色3px | ❌ 静止 | ✅ 拉伸 |

**统一图标**: **beaker-16** (GitHub Octicon - 烧杯图标，代表Mock实验)

**背景闪烁**（仅Active状态）：
```css
@keyframes breathe-green {
  0%, 100% { background-color: #DAFBE1; }
  50% { background-color: #B4F4CA; }
}
.em-animate-breathe-green {
  animation: breathe-green 3s ease-in-out infinite;
}
```

### 5.5 右侧吸附 - HTML原型（最终版 - 一体化拉伸）

#### Idle状态（灰色静止）

```html
<!-- IDLE状态（灰色静止） -->
<div class="em-fixed em-top-1/2 em-right-0 em-z-50 em-translate-y-[-50%]">
  <button
    class="em-group em-flex em-h-11 em-w-12 em-items-center em-justify-center em-rounded-l-2xl em-border-y em-border-l em-border-[#D0D7DE] em-bg-white em-shadow-sm em-transition-all hover:em-bg-[#F6F8FA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="Open Error Mock"
  >
    <!-- 圆形图标容器（灰色静止） -->
    <div class="em-flex em-h-7 em-w-7 em-items-center em-justify-center em-rounded-full em-bg-[#F6F8FA] em-text-[#656D76] group-hover:em-bg-[#EAEIEF] group-hover:em-text-[#1F2328] em-transition-colors">
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
      </svg>
    </div>
  </button>
</div>
```

#### Active状态（绿色闪烁 + Hover一体拉伸）

```html
<!-- ACTIVE状态（绿色闪烁 + Hover一体拉伸） -->
<div class="em-fixed em-top-1/2 em-right-0 em-z-50 em-translate-y-[-50%]">
  <button
    class="em-group em-relative em-flex em-h-11 em-w-12 em-cursor-pointer em-items-center em-overflow-hidden em-rounded-l-2xl em-border-y em-border-l em-border-[#D0D7DE] em-bg-white em-shadow-sm em-transition-all em-duration-300 em-ease-[cubic-bezier(0.2,0,0,1)] hover:em-w-auto hover:em-pr-12 focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="3 Active Mocks"
  >
    <!-- 绿色指示条（右边缘） -->
    <div class="em-absolute em-right-0 em-top-0 em-bottom-0 em-w-[3px] em-bg-[#2DA44E] em-z-20"></div>

    <!-- 图标容器（固定右侧） -->
    <div class="em-absolute em-right-0 em-top-0 em-flex em-h-11 em-w-12 em-items-center em-justify-center em-z-10">
      <div class="em-flex em-h-7 em-w-7 em-items-center em-justify-center em-rounded-full em-bg-[#DAFBE1] em-animate-breathe-green em-text-[#1F883D]">
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
        </svg>
      </div>
    </div>

    <!-- 内容区（Hover展开） -->
    <div class="em-flex em-items-center em-gap-3 em-pl-4 em-opacity-0 em-w-0 group-hover:em-w-auto group-hover:em-opacity-100 em-transition-all em-duration-300 em-delay-75">
      <!-- 状态文字 -->
      <div class="em-flex em-flex-col em-justify-center em-mr-1">
        <span class="em-text-xs em-font-bold em-text-[#1F2328] em-whitespace-nowrap em-leading-none">3 Active</span>
        <span class="em-text-[10px] em-font-medium em-text-[#1F883D] em-leading-none em-mt-0.5">Mocking...</span>
      </div>

      <!-- 分隔线 -->
      <div class="em-h-4 em-w-px em-bg-[#D0D7DE]"></div>

      <!-- Pause按钮 -->
      <div class="em-flex em-items-center em-gap-1.5 em-rounded hover:em-bg-[#FFF8C5] hover:em-text-[#9A6700] em-px-1.5 em-py-1 em-transition-colors">
         <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
           <path d="M4.5 2h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Zm5 0h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z"/>
         </svg>
         <span class="em-text-xs em-font-medium">Pause</span>
      </div>
    </div>
  </button>
</div>
```

#### Paused状态（黄色警示 + Hover拉伸显示Resume）

```html
<!-- PAUSED状态（黄色警示 + Hover一体拉伸） -->
<div class="em-fixed em-top-1/2 em-right-0 em-z-50 em-translate-y-[-50%]">
  <button
    class="em-group em-relative em-flex em-h-11 em-w-12 em-cursor-pointer em-items-center em-overflow-hidden em-rounded-l-2xl em-border-y em-border-l em-border-[#D0D7DE] em-bg-white em-shadow-sm em-transition-all em-duration-300 em-ease-[cubic-bezier(0.2,0,0,1)] hover:em-w-auto hover:em-pr-12 focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="3 Paused Mocks"
  >
    <!-- 黄色指示条（右边缘） -->
    <div class="em-absolute em-right-0 em-top-0 em-bottom-0 em-w-[3px] em-bg-[#D4A72C] em-z-20"></div>

    <!-- 图标容器（固定右侧） -->
    <div class="em-absolute em-right-0 em-top-0 em-flex em-h-11 em-w-12 em-items-center em-justify-center em-z-10">
      <div class="em-flex em-h-7 em-w-7 em-items-center em-justify-center em-rounded-full em-bg-[#FFF8C5] em-text-[#9A6700]">
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
        </svg>
      </div>
    </div>

    <!-- 内容区（Hover展开） -->
    <div class="em-flex em-items-center em-gap-3 em-pl-4 em-opacity-0 em-w-0 group-hover:em-w-auto group-hover:em-opacity-100 em-transition-all em-duration-300 em-delay-75">
      <!-- 状态文字 -->
      <div class="em-flex em-flex-col em-justify-center em-mr-1">
        <span class="em-text-xs em-font-bold em-text-[#1F2328] em-whitespace-nowrap em-leading-none">3 Paused</span>
        <span class="em-text-[10px] em-font-medium em-text-[#9A6700] em-leading-none em-mt-0.5">Mocking off</span>
      </div>

      <!-- 分隔线 -->
      <div class="em-h-4 em-w-px em-bg-[#D0D7DE]"></div>

      <!-- Resume按钮 -->
      <div class="em-flex em-items-center em-gap-1.5 em-rounded hover:em-bg-[#DAFBE1] hover:em-text-[#1F883D] em-px-1.5 em-py-1 em-transition-colors">
         <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
           <path d="M6 12.796V3.204L11.481 8 6 12.796Zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753Z"/>
         </svg>
         <span class="em-text-xs em-font-medium">Resume</span>
      </div>
    </div>
  </button>
</div>
```

### 5.5 左侧吸附 - HTML原型（镜像版本）

#### Active状态

```html
<!-- FLOAT BUTTON: LEFT DOCK - ACTIVE -->
<div class="em-fixed em-top-1/2 em-left-0 em-z-50 em-flex em-translate-y-[-50%] em-flex-row em-items-center em-group">

  <!-- 主按钮 -->
  <button
    class="em-relative em-flex em-h-10 em-w-8 em-items-center em-justify-center em-rounded-r-xl em-border-y em-border-r em-border-[#D0D7DE] em-bg-white em-shadow-sm em-text-[#1F883D] em-transition-all hover:em-w-10 hover:em-bg-[#F6F8FA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="3 Active Mocks"
  >
    <!-- 绿色指示条（左边缘） -->
    <div class="em-absolute em-left-0 em-top-0 em-bottom-0 em-w-[2px] em-bg-[#2DA44E]"></div>

    <!-- 绿色脉冲圆点（右上角） -->
    <span class="em-absolute em-top-1.5 em-right-1.5 em-flex em-h-2 em-w-2">
      <span class="em-absolute em-inline-flex em-h-full em-w-full em-animate-ping em-rounded-full em-bg-[#2DA44E] em-opacity-75"></span>
      <span class="em-relative em-inline-flex em-h-2 em-w-2 em-rounded-full em-bg-[#2DA44E]"></span>
    </span>

    <!-- broadcast图标 -->
    <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 3.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5Z"/>
      <path d="M5.46 3.12a6.38 6.38 0 0 1 5.08 0 .75.75 0 0 1-.53 1.403 4.881 4.881 0 0 0-3.886 0 .75.75 0 0 1-.664-1.404ZM3.447 1.487a9.38 9.38 0 0 1 9.106 0 .75.75 0 1 1-.606 1.372 7.88 7.88 0 0 0-7.894 0 .75.75 0 1 1-.606-1.372ZM8 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
    </svg>
  </button>

  <!-- Hover展开面板（向右滑出） -->
  <div class="em-ml-1 em-flex em-h-10 em-items-center em-overflow-hidden em-rounded-lg em-border em-border-[#D0D7DE] em-bg-white em-shadow-md em-opacity-0 em-translate-x-[-16px] em-pointer-events-none em-transition-all em-duration-200 em-ease-out group-hover:em-opacity-100 group-hover:em-translate-x-0 group-hover:em-pointer-events-auto">

    <!-- 状态文字区 -->
    <div class="em-flex em-h-full em-items-center em-px-3 em-border-r em-border-[#D0D7DE] em-bg-[#F6F8FA]">
      <span class="em-text-xs em-font-semibold em-text-[#1F2328] em-whitespace-nowrap">3 Active</span>
    </div>

    <!-- Pause按钮 -->
    <button class="em-flex em-h-full em-items-center em-gap-1.5 em-px-3 hover:em-bg-[#FFF8C5] hover:em-text-[#9A6700] em-transition-colors" title="Pause All Mocks">
      <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.5 2h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Zm5 0h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z"/>
      </svg>
      <span class="em-text-xs em-font-medium">Pause</span>
    </button>
  </div>
</div>
```

### 5.6 左侧吸附 - HTML原型（镜像版本）

#### Active状态

```html
<!-- FLOAT BUTTON: LEFT DOCK - ACTIVE -->
<div class="em-fixed em-top-1/2 em-left-0 em-z-50 em-flex em-translate-y-[-50%] em-flex-row em-items-center em-group">

  <!-- 主按钮 -->
  <button
    class="em-relative em-flex em-h-12 em-w-10 em-items-center em-justify-center em-rounded-r-3xl em-border-y em-border-r em-border-[#D0D7DE] em-bg-white em-shadow-sm em-transition-all hover:em-w-12 hover:em-bg-[#F6F8FA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="3 Active Mocks"
  >
    <!-- 绿色指示条（左边缘，3px） -->
    <div class="em-absolute em-left-0 em-top-0 em-bottom-0 em-w-[3px] em-bg-[#2DA44E]"></div>

    <!-- 图标容器：圆形（浅绿背景） -->
    <div class="em-relative em-flex em-h-7 em-w-7 em-items-center em-justify-center em-rounded-full em-bg-[#DAFBE1] em-text-[#1F883D]">
      <!-- beaker图标 -->
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
      </svg>

      <!-- 绿色脉冲圆点（圆形容器左上角） -->
      <span class="em-absolute em-top-0 em-left-0 em-flex em-h-2.5 em-w-2.5 em-translate-x-[-25%] em-translate-y-[-25%]">
        <span class="em-absolute em-inline-flex em-h-full em-w-full em-animate-ping em-rounded-full em-bg-[#2DA44E] em-opacity-75"></span>
        <span class="em-relative em-inline-flex em-h-2.5 em-w-2.5 em-rounded-full em-bg-[#2DA44E] em-ring-2 em-ring-white"></span>
      </span>
    </div>
  </button>

  <!-- Hover展开面板（向右滑出） -->
  <div class="em-ml-1 em-flex em-h-10 em-items-center em-overflow-hidden em-rounded-lg em-border em-border-[#D0D7DE] em-bg-white em-shadow-md em-opacity-0 em-translate-x-[-16px] em-pointer-events-none em-transition-all em-duration-200 em-ease-out group-hover:em-opacity-100 group-hover:em-translate-x-0 group-hover:em-pointer-events-auto">

    <!-- 状态文字区 -->
    <div class="em-flex em-h-full em-items-center em-px-3 em-border-r em-border-[#D0D7DE] em-bg-[#F6F8FA]">
      <span class="em-text-xs em-font-semibold em-text-[#1F2328] em-whitespace-nowrap">3 Active</span>
    </div>

    <!-- Pause按钮 -->
    <button class="em-flex em-h-full em-items-center em-gap-1.5 em-px-3 hover:em-bg-[#FFF8C5] hover:em-text-[#9A6700] em-transition-colors" title="Pause All Mocks">
      <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.5 2h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Zm5 0h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z"/>
      </svg>
      <span class="em-text-xs em-font-medium">Pause</span>
    </button>
  </div>
</div>
```

### 5.6 左侧吸附 - HTML原型（镜像版本）

#### Active状态

```html
<!-- FLOAT BUTTON: LEFT DOCK - ACTIVE -->
<div class="em-fixed em-top-1/2 em-left-0 em-z-50 em-flex em-translate-y-[-50%] em-flex-row em-items-center em-group">

  <!-- 主按钮 -->
  <button
    class="em-relative em-flex em-h-16 em-w-14 em-items-center em-justify-center em-rounded-r-[32px] em-border-y em-border-r em-border-[#D0D7DE] em-bg-white em-shadow-sm em-transition-all hover:em-w-16 hover:em-bg-[#F6F8FA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="3 Active Mocks"
  >
    <!-- 绿色指示条（左边缘，3px） -->
    <div class="em-absolute em-left-0 em-top-0 em-bottom-0 em-w-[3px] em-bg-[#2DA44E]"></div>

    <!-- 图标容器：圆形（浅绿背景） -->
    <div class="em-relative em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-full em-bg-[#DAFBE1] em-text-[#1F883D]">
      <!-- beaker图标 -->
      <svg class="em-h-5 em-w-5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
      </svg>

      <!-- 绿色脉冲圆点（右上角，远离左边缘） -->
      <span class="em-absolute em-top-0 em-right-0 em-flex em-h-2.5 em-w-2.5 em-translate-x-[15%] em-translate-y-[-15%]">
        <span class="em-absolute em-inline-flex em-h-full em-w-full em-animate-ping em-rounded-full em-bg-[#2DA44E] em-opacity-75"></span>
        <span class="em-relative em-inline-flex em-h-2.5 em-w-2.5 em-rounded-full em-bg-[#2DA44E] em-ring-2 em-ring-white"></span>
      </span>
    </div>
  </button>

  <!-- Hover展开面板（向右滑出） -->
  <div class="em-ml-1 em-flex em-h-10 em-items-center em-overflow-hidden em-rounded-lg em-border em-border-[#D0D7DE] em-bg-white em-shadow-md em-opacity-0 em-translate-x-[-16px] em-pointer-events-none em-transition-all em-duration-200 em-ease-out group-hover:em-opacity-100 group-hover:em-translate-x-0 group-hover:em-pointer-events-auto">

    <!-- 状态文字区 -->
    <div class="em-flex em-h-full em-items-center em-px-3 em-border-r em-border-[#D0D7DE] em-bg-[#F6F8FA]">
      <span class="em-text-xs em-font-semibold em-text-[#1F2328] em-whitespace-nowrap">3 Active</span>
    </div>

    <!-- Pause按钮 -->
    <button class="em-flex em-h-full em-items-center em-gap-1.5 em-px-3 hover:em-bg-[#FFF8C5] hover:em-text-[#9A6700] em-transition-colors" title="Pause All Mocks">
      <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.5 2h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Zm5 0h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z"/>
      </svg>
      <span class="em-text-xs em-font-medium">Pause</span>
    </button>
  </div>
</div>
```

### 5.6 左侧吸附 - HTML原型（镜像版本）

#### Active状态（一体化拉伸）

```html
<!-- ACTIVE状态（左侧吸附 - 绿色闪烁） -->
<div class="em-fixed em-top-1/2 em-left-0 em-z-50 em-translate-y-[-50%]">
  <button
    class="em-group em-relative em-flex em-h-12 em-w-12 em-flex-row-reverse em-items-center em-gap-2 em-rounded-r-3xl em-border-y em-border-r em-border-[#D0D7DE] em-bg-white em-pl-2 em-pr-2 em-shadow-sm em-transition-all hover:em-w-auto hover:em-pl-3 hover:em-pr-3 focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    aria-label="3 Active Mocks"
  >
    <!-- 绿色指示条（左边缘） -->
    <div class="em-absolute em-left-0 em-top-0 em-bottom-0 em-w-[3px] em-bg-[#2DA44E]"></div>

    <!-- 圆形图标容器（绿色闪烁） -->
    <div class="em-flex em-h-8 em-w-8 em-shrink-0 em-items-center em-justify-center em-rounded-full em-bg-[#DAFBE1] em-text-[#1F883D] em-animate-breathe-green">
      <svg class="em-h-5 em-w-5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
      </svg>
    </div>

    <!-- Pause按钮（Hover显示，注意左侧是reverse顺序） -->
    <div class="em-hidden em-items-center em-gap-1 group-hover:em-flex">
      <svg class="em-h-3.5 em-w-3.5 em-text-[#9A6700]" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.5 2h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Zm5 0h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z"/>
      </svg>
      <span class="em-text-xs em-font-medium em-text-[#656D76]">Pause</span>
    </div>

    <!-- 分隔线（Hover显示） -->
    <div class="em-hidden em-h-6 em-w-px em-bg-[#D0D7DE] group-hover:em-block"></div>

    <!-- 状态文字（Hover显示） -->
    <span class="em-hidden em-whitespace-nowrap em-text-xs em-font-semibold em-text-[#1F2328] group-hover:em-inline-block">
      3 Active
    </span>
  </button>
</div>
```

### 5.6 设计要点（最终版 - 经Gemini+Codex联合审核）

**核心创新**：
- ✅ **去掉脉冲圆点** - 用背景闪烁替代
- ✅ **一体化拉伸** - Hover时主按钮本身拉长（Morphing变形）
- ✅ **3种状态颜色** - 绿色闪烁/黄色静止/灰色静止
- ✅ **更精致尺寸** - 44x48px紧凑标签

**视觉规格**（Gemini推荐）：
- 默认尺寸：**44px高 x 48px宽**（h-11 w-12）- iOS黄金触控尺寸
- Hover拉伸：w-auto（约200px）
- 圆角：rounded-2xl（16px）
- 图标容器：7x7圆形
- 图标：4x4（16px）- GitHub Octicon标准尺寸

**状态颜色**：
- 🟢 Active: 绿色背景闪烁（`#DAFBE1 ↔ #B4F4CA`，3s呼吸）
- 🟡 Paused: 黄色背景静止（`#FFF8C5`）
- ⚪ Idle: 灰色背景静止（`#F6F8FA`）

**Hover拉伸内容**（仅Active/Paused）：
- 图标（固定右侧，absolute定位，z-10）
- 状态文字（"3 Active" + "Mocking..." 两行）
- 分隔线
- 操作按钮（Pause / Resume，可点击区域）

**极简交互**：
- 点击图标区 → 打开Modal
- 点击Pause/Resume → 切换状态
- 拖拽 → 吸附到侧边
- Idle状态不拉伸

**动画细节**：
- 背景闪烁：3s ease-in-out infinite（仅Active）
- 宽度拉伸：300ms cubic-bezier(0.2,0,0,1)
- 内容opacity：delay-75ms避免闪现
- 拖拽时禁用Hover

**技术实施建议**（Codex审核）：
- 复杂度：5/10（可控）
- 使用transform替代w-auto transition避免布局跳跃
- 拖拽时isDragging flag禁用Hover
- 状态机管理所有状态（side + dragging + hover + paused）
- opacity延迟50-100ms避免闪现

---

## 附录：完整HTML原型清单

本文档包含22个完整HTML原型：

### Header（2个）
1. 单选模式Header
2. 批量模式Header

### Sidebar（8个）
3. Filter输入框
4. 批量操作工具栏
5. 模块折叠Header
6. API项目 - 单选状态
7. API项目 - 批量选中状态
8. API项目 - 双重状态
9. 全局状态栏（带脉冲动画）
10. API项目 - 未选中状态（Hover显示Checkbox）

### Footer（2个）
11. 单选模式Footer
12. 批量模式Footer

### FloatButton（6个）✅ 最终版
13. 右侧吸附 - Idle状态
14. 右侧吸附 - Active状态（绿色闪烁 + Hover一体拉伸）
15. 右侧吸附 - Paused状态（黄色警示 + Hover拉伸）
16. 左侧吸附 - Idle状态
17. 左侧吸附 - Active状态（一体拉伸）
18. 左侧吸附 - Paused状态

**总计**: 24个核心HTML原型，支持完整的布局设计
