# Tab Content核心设计

> **文档说明**: 本文档整合Tab Content区域的所有核心设计
> **HTML原型总数**: 6个完整代码块（新增3个）
> **设计来源**: Gemini (Google AI) 第六轮、第七轮、第九轮审核
> **最后更新**: 2025-12-10
> **状态**: ✅ 核心Tab原型已完成

---

## 第1章：控制栏（单选模式）

### 1.1 设计原则（Gemini第七轮统一设计）

**统一控制栏设计（Option B）**：

Gemini第七轮确认，为了设计一致性和符合人体工程学，**Header不再包含控制（Mock Type、Enable）**，这些控制已全部移至**Tab Content控制栏**。

**Gemini评价**：
> "Controls should be adjacent to the object they modify. If I am editing the properties of `/api/login`, the 'Enable' switch is a property of that API. It belongs in the **Property Editor (Tab Content)**, not the Window Title Bar."

### 1.2 单选模式控制栏HTML

**位置**: Tab Content最顶部，替代原来的Tab导航栏

**HTML原型（完整代码）**：

```html
<!-- CONTROL BAR (Top of Tab Content - Single Mode) -->
<div class="em-shrink-0 em-border-b em-border-[#D0D7DE] em-bg-white em-px-6 em-py-3">

  <div class="em-flex em-items-center em-justify-between">

    <!-- Left: Tabs -->
    <nav class="em-flex em-gap-1">
      <button class="em-rounded-md em-bg-[#F6F8FA] em-px-3 em-py-1.5 em-text-sm em-font-medium em-text-[#1F2328] hover:em-bg-[#F3F4F6]">
        Network
      </button>
      <button class="em-rounded-md em-px-3 em-py-1.5 em-text-sm em-font-medium em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328]">
        Response
      </button>
      <button class="em-rounded-md em-px-3 em-py-1.5 em-text-sm em-font-medium em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328]">
        Advanced
      </button>
    </nav>

    <!-- Right: Primary Actions (Moved from Header) -->
    <div class="em-flex em-items-center em-gap-4">

      <!-- Mock Type Dropdown -->
      <div class="em-relative">
        <select class="em-w-36 em-appearance-none em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-1.5 em-pr-8 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none">
          <option value="networkError">Network Error</option>
          <option value="businessError">Business Error</option>
          <option value="success">Success</option>
          <option value="none">None</option>
        </select>
        <!-- Chevron -->
        <svg class="em-pointer-events-none em-absolute em-right-2.5 em-top-2.5 em-h-3 em-w-3 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 5.22a.75.75 0 0 1 1.06 0L8 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 6.28a.75.75 0 0 1 0-1.06Z"/></svg>
      </div>

      <div class="em-h-4 em-w-px em-bg-[#D0D7DE]"></div>

      <!-- Enable Toggle -->
      <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
        <span class="em-text-xs em-font-medium em-text-[#1F2328]">Enable</span>
        <input type="checkbox" class="em-peer em-sr-only">
        <div class="em-relative em-h-5 em-w-9 em-rounded-full em-bg-[#D0D7DE] em-transition-colors peer-checked:em-bg-[#1F883D] peer-focus:em-ring-2 peer-focus:em-ring-[#0969DA] peer-focus:em-ring-offset-1">
           <span class="em-absolute em-left-[2px] em-top-[2px] em-h-4 em-w-4 em-rounded-full em-bg-white em-shadow-sm em-transition-transform peer-checked:em-translate-x-4"></span>
        </div>
      </label>
    </div>
  </div>
</div>
```

**设计要点**：
- **左侧**：Tab导航（圆角按钮，GitHub风格）
- **右侧**：Mock Type下拉 + Enable Toggle
- **背景**：纯白色（`bg-white`）
- **替代**：原Tab Navigation栏位置

---

## 第2章：批量上下文栏（批量模式）

### 2.1 设计目标

**Gemini分析**：

#### 费茨定律（Fitt's Law）
> "Selecting items happens in the Sidebar (bottom-left). Editing happens in the Tab Content (center). Forcing the mouse to travel all the way up to the Header (top-right) for 'Enable All' is **inefficient**."

#### Figma/Properties面板模式
> "It mimics the **Figma / Properties Panel** pattern."
- **Selection**: Left (Sidebar)
- **Properties**: Right (Tab Content)
- **Context**: Properties面板顶部告诉你"正在编辑什么"

### 2.2 批量上下文栏HTML

**位置**: Tab Content最顶部，替代控制栏

**HTML原型（完整代码）**：

```html
<!-- BATCH CONTEXT BAR (Sticky Top of Tab Content) -->
<!-- Visible ONLY when selectedCount > 1 -->
<div class="em-sticky em-top-0 em-z-10 em-shrink-0 em-border-b em-border-blue-200 em-bg-blue-50 em-px-6 em-py-3 em-shadow-sm">

  <div class="em-flex em-items-center em-justify-between">

    <!-- Left: Batch Information -->
    <div class="em-flex em-items-center em-gap-3">
      <!-- Icon: Stack/Collection in Blue Circle -->
      <div class="em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-full em-bg-white em-text-[#0969DA] em-shadow-sm em-ring-1 em-ring-blue-100">
        <!-- Octicon: stack-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.75 12.5a.75.75 0 0 1 .75.75V15h3a.75.75 0 0 1 0-1.5H9.25a.75.75 0 0 1 0-1.5h3.25a1.5 1.5 0 0 1 1.5 1.5v2.25a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75V13.5a1.5 1.5 0 0 1 1.5-1.5h3.25a.75.75 0 0 1 0 1.5H5.5a.75.75 0 0 1 0 1.5h3v-1.75a.75.75 0 0 1-.25-.75ZM2.75 4a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75ZM1 8.75A.75.75 0 0 1 1.75 8h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8.75Z" />
        </svg>
      </div>

      <div class="em-leading-tight">
        <h2 class="em-text-sm em-font-bold em-text-[#1F2328]">Batch Editing</h2>
        <p class="em-text-xs em-text-[#656D76]">
          Modifying <span class="em-font-bold em-text-[#0969DA]">3</span> selected items
        </p>
      </div>
    </div>

    <!-- Right: Quick Actions -->
    <div class="em-flex em-items-center em-gap-5">

      <!-- Enable All Toggle -->
      <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
        <span class="em-text-xs em-font-bold em-text-[#1F2328]">Enable All</span>
        <input type="checkbox" class="em-peer em-sr-only">
        <div class="em-relative em-h-5 em-w-9 em-rounded-full em-bg-[#D0D7DE] em-transition-colors peer-checked:em-bg-[#1F883D] peer-focus:em-ring-2 peer-focus:em-ring-[#0969DA] peer-focus:em-ring-offset-1">
           <span class="em-absolute em-left-[2px] em-top-[2px] em-h-4 em-w-4 em-rounded-full em-bg-white em-shadow-sm em-transition-transform peer-checked:em-translate-x-4"></span>
        </div>
      </label>

      <!-- Cancel Batch Link -->
      <button
        class="em-text-xs em-font-medium em-text-[#CF222E] hover:em-underline focus:em-rounded focus:em-outline-none focus:em-ring-2 focus:em-ring-[#CF222E]/40"
        aria-label="Cancel batch selection"
      >
        Cancel Batch
      </button>
    </div>
  </div>
</div>
```

**设计亮点**：
- 📦 堆叠图标（GitHub Octicon: stack-16）
- 🔵 浅蓝色背景（`bg-blue-50`）明确批量模式
- 📌 Sticky定位（滚动时保持可见）
- ✅ Enable All Toggle在用户视觉焦点区域

### 2.3 交互规范

**Enable All Toggle**：
- **明确标签**: "Enable All"（不是模糊的Toggle）
- **使用peer技巧**：Tailwind的peer-checked状态

**Cancel Batch链接**：
- **红色文字**: `text-[#CF222E]`（暗示取消操作）
- **Hover下划线**: `hover:em-underline`
- **Focus环**: `focus:em-ring-2 focus:em-ring-[#CF222E]/40`

---

## 第3章：Advanced Tab设计

### 3.1 Field Omission完整配置

**Gemini评价**：
> "This is the strongest part of the redesign. It balances power vs. simplicity."

**HTML原型（完整代码）**：

```html
<!-- FIELD OMISSION (Grouped Disclosure) -->
<div class="em-space-y-6">
  <div class="em-flex em-items-center em-justify-between">
      <h2 class="em-text-lg em-font-semibold em-text-[#1F2328]">Field Omission</h2>
      <span class="em-rounded-full em-border em-border-[#D0D7DE] em-px-2 em-py-0.5 em-text-xs em-font-medium em-text-gray-500">Random Mode</span>
  </div>

  <!-- Always Visible Configs -->
  <div class="em-grid em-grid-cols-2 em-gap-6">
      <!-- Probability -->
      <div class="em-space-y-1">
          <label class="em-block em-text-sm em-font-semibold em-text-[#1F2328]">Omission Probability</label>
          <div class="em-flex em-items-center em-gap-3">
              <input type="range" min="0" max="1" step="0.01" value="0.2" class="em-h-2 em-w-full em-cursor-pointer em-rounded-lg em-bg-gray-200 em-accent-[#0969DA]">
              <span class="em-w-12 em-rounded em-border em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-2 em-py-1 em-text-center em-text-sm em-font-mono">0.2</span>
          </div>
      </div>

       <!-- Mode (Button Group) -->
       <div class="em-space-y-1">
          <label class="em-block em-text-sm em-font-semibold em-text-[#1F2328]">Omission Mode</label>
          <div class="em-flex em-rounded-md em-shadow-sm" role="group">
              <button type="button" class="em-rounded-l-md em-border em-border-[#D0D7DE] em-bg-[#0969DA] em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-white focus:em-z-10 focus:em-ring-2 focus:em-ring-blue-500">Value</button>
              <button type="button" class="em-rounded-r-md em-border em-border-l-0 em-border-[#D0D7DE] em-bg-white em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-gray-700 hover:em-bg-gray-50 focus:em-z-10 focus:em-ring-2 focus:em-ring-blue-500">Key</button>
          </div>
      </div>
  </div>

  <hr class="em-border-[#D0D7DE]">

  <!-- Accordion 1: Constraints -->
  <details class="em-group em-rounded-md em-border em-border-[#D0D7DE] em-bg-white open:em-shadow-sm">
      <summary class="em-flex em-cursor-pointer em-items-center em-justify-between em-bg-[#F6F8FA] em-px-4 em-py-2 em-text-sm em-font-semibold em-text-[#1F2328] hover:em-bg-gray-100 focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA] group-open:em-rounded-t-md group-open:em-border-b group-open:em-border-[#D0D7DE]">
          <span>Constraints</span>
          <!-- Chevron rotation -->
          <svg class="em-h-5 em-w-5 em-text-gray-500 em-transition-transform group-open:em-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
      </summary>

      <div class="em-grid em-grid-cols-3 em-gap-4 em-p-4">
          <div class="em-space-y-1">
              <label class="em-block em-text-xs em-font-medium em-text-gray-600">Max Count</label>
              <input type="number" class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-px-2 em-py-1 em-text-sm focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30" placeholder="Unlimited">
          </div>
          <div class="em-space-y-1">
              <label class="em-block em-text-xs em-font-medium em-text-gray-600">Max Depth</label>
              <input type="number" class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-px-2 em-py-1 em-text-sm focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30" value="3">
          </div>
           <div class="em-space-y-1">
              <label class="em-block em-text-xs em-font-medium em-text-gray-600">Seed</label>
              <input type="text" class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-px-2 em-py-1 em-text-sm focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30" placeholder="Random">
          </div>
      </div>
  </details>

   <!-- Accordion 2: Exceptions -->
   <details class="em-group em-rounded-md em-border em-border-[#D0D7DE] em-bg-white open:em-shadow-sm">
      <summary class="em-flex em-cursor-pointer em-items-center em-justify-between em-bg-[#F6F8FA] em-px-4 em-py-2 em-text-sm em-font-semibold em-text-[#1F2328] hover:em-bg-gray-100 focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA] group-open:em-rounded-t-md group-open:em-border-b group-open:em-border-[#D0D7DE]">
          <span>Exceptions</span>
          <svg class="em-h-5 em-w-5 em-text-gray-500 em-transition-transform group-open:em-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
      </summary>

      <div class="em-p-4">
          <label class="em-mb-2 em-block em-text-xs em-font-medium em-text-gray-600">Excluded Fields (comma separated)</label>
          <textarea class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-px-3 em-py-2 em-text-sm em-font-mono focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30" rows="2" placeholder="id, created_at, ..."></textarea>
      </div>
  </details>
</div>
```

**设计结构**：
- **Always visible configs**: Omission Probability（滑块） + Omission Mode（Value/Key按钮组）
- **Accordion 1 "Constraints"**: Max Count、Max Depth、Seed
- **Accordion 2 "Exceptions"**: Excluded Fields

**为什么优秀**：
- 解决了P0长滚动问题
- 核心功能（概率、模式）一目了然
- 高级选项不干扰主流程

---

## 第4章：Network Tab设计

### 4.1 设计思路

**布局策略**：
- 采用 `grid-cols-[140px_1fr]` 布局，确保左侧标签对齐
- 重点优化Slider视觉体验，增加当前值的Badge显示
- 底部Toggle开关带辅助说明文字

**HTML原型（完整代码）**：

```html
<!-- NETWORK TAB CONTENT -->
<div class="em-mx-auto em-max-w-3xl em-p-6">

  <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-8 em-items-start">

    <!-- 1. Delay Control -->
    <label for="net-delay" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
      Delay
    </label>
    <div class="em-max-w-sm">
      <div class="em-relative">
        <input
          type="number"
          id="net-delay"
          value="0"
          min="0"
          class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        >
        <div class="em-pointer-events-none em-absolute em-inset-y-0 em-right-0 em-flex em-items-center em-pr-3">
          <span class="em-text-sm em-text-[#656D76]">ms</span>
        </div>
      </div>
      <p class="em-mt-1 em-text-xs em-text-[#656D76]">
        Simulated latency added to the response.
      </p>
    </div>

    <!-- 2. Failure Rate Slider -->
    <label for="net-fail-rate" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
      Failure Rate
    </label>
    <div class="em-max-w-md">
      <div class="em-flex em-items-center em-gap-4">
        <input
          type="range"
          id="net-fail-rate"
          min="0"
          max="1"
          step="0.1"
          value="0.2"
          class="em-h-2 em-w-full em-cursor-pointer em-rounded-lg em-bg-[#EFF1F3] em-accent-[#0969DA]"
        >
        <span class="em-flex em-h-6 em-w-12 em-items-center em-justify-center em-rounded-full em-bg-[#F6F8FA] em-border em-border-[#D0D7DE] em-text-xs em-font-mono em-font-medium em-text-[#1F2328]">
          20%
        </span>
      </div>
      <p class="em-mt-2 em-text-xs em-text-[#656D76]">
        Probability of the request failing (0.0 to 1.0).
      </p>
    </div>

    <!-- Divider -->
    <div class="em-col-span-2 em-my-2 em-border-t em-border-[#D0D7DE]"></div>

    <!-- 3. Toggles Section -->
    <div class="em-col-span-2 em-space-y-6">

      <!-- Timeout Toggle -->
      <div class="em-flex em-items-start em-gap-3">
        <div class="em-flex em-h-6 em-items-center">
          <input
            id="net-timeout"
            type="checkbox"
            class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          >
        </div>
        <div>
          <label for="net-timeout" class="em-text-sm em-font-semibold em-text-[#1F2328]">
            Simulate Timeout
          </label>
          <p class="em-text-xs em-text-[#656D76]">
            Force the request to time out, ignoring the delay setting.
          </p>
        </div>
      </div>

      <!-- Offline Toggle -->
      <div class="em-flex em-items-start em-gap-3">
        <div class="em-flex em-h-6 em-items-center">
          <input
            id="net-offline"
            type="checkbox"
            class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          >
        </div>
        <div>
          <label for="net-offline" class="em-text-sm em-font-semibold em-text-[#1F2328]">
            Simulate Offline Mode
          </label>
          <p class="em-text-xs em-text-[#656D76]">
            Simulate a network disconnection (browser offline).
          </p>
        </div>
      </div>

    </div>

  </div>
</div>
```

**设计要点**：
- Delay输入框：右侧内嵌`ms`单位标识
- Failure Rate滑块：实时显示百分比Badge（圆角灰色背景）
- Toggle开关：标签+辅助说明的垂直布局
- 间距：`gap-y-8`确保视觉呼吸感

---

## 第5章：Response Tab设计

### 5.1 设计思路

**条件渲染策略**：
- 根据 `mockType` 状态严格区分界面
- 错误表单采用标准垂直堆叠布局
- Info Card使用GitHub Flash Alert样式

### 5.2 场景A：Business Error配置

**HTML原型（完整代码）**：

```html
<!-- RESPONSE TAB CONTENT - Business Error -->
<div class="em-mx-auto em-max-w-3xl em-p-6">

  <div class="em-space-y-5">
    <!-- Header -->
    <div class="em-flex em-items-center em-gap-2 em-mb-4">
      <div class="em-h-8 em-w-8 em-flex em-items-center em-justify-center em-rounded-full em-bg-red-50 em-text-[#CF222E]">
        <!-- Octicon: alert-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>
      </div>
      <h3 class="em-text-base em-font-semibold em-text-[#1F2328]">Business Error Configuration</h3>
    </div>

    <!-- Error Code -->
    <div>
      <label class="em-mb-1.5 em-block em-text-sm em-font-semibold em-text-[#1F2328]">Error Code (err_no)</label>
      <input
        type="number"
        class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        placeholder="e.g. 40100"
      >
    </div>

    <!-- Error Message -->
    <div>
      <label class="em-mb-1.5 em-block em-text-sm em-font-semibold em-text-[#1F2328]">Error Message (err_msg)</label>
      <input
        type="text"
        class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        placeholder="e.g. Unauthorized access"
      >
    </div>

    <!-- Detailed Message -->
    <div>
      <label class="em-mb-1.5 em-block em-text-sm em-font-semibold em-text-[#1F2328]">Details (detail_err_msg)</label>
      <textarea
        rows="3"
        class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        placeholder="JSON or text details..."
      ></textarea>
    </div>
  </div>

</div>
```

### 5.3 场景B：Success Info卡片

**HTML原型（完整代码）**：

```html
<!-- RESPONSE TAB CONTENT - Success Mode -->
<div class="em-mx-auto em-max-w-3xl em-p-6">

  <div class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-[#F6F8FA] em-p-4">
    <div class="em-flex em-gap-3">
      <!-- Icon: check-circle-16 -->
      <svg class="em-mt-0.5 em-h-5 em-w-5 em-shrink-0 em-text-[#1F883D]" viewBox="0 0 16 16" fill="currentColor"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"/></svg>

      <div>
        <h3 class="em-text-sm em-font-bold em-text-[#1F2328]">Success Response</h3>
        <p class="em-mt-1 em-text-sm em-text-[#656D76]">
          This API will return a standard successful response (200 OK).
          <br>
          To simulate partial data loading or missing fields, configure
          <a href="#" class="em-font-medium em-text-[#0969DA] em-underline em-decoration-1 hover:em-decoration-2">Field Omission</a>
          in the <strong>Advanced Tab</strong>.
        </p>
      </div>
    </div>
  </div>

</div>
```

### 5.4 场景C：Network Error Info卡片

**HTML原型（完整代码）**：

```html
<!-- RESPONSE TAB CONTENT - Network Error Mode -->
<div class="em-mx-auto em-max-w-3xl em-p-6">

  <div class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-[#F6F8FA] em-p-4">
    <div class="em-flex em-gap-3">
      <!-- Icon: globe-16 (warning styled) -->
      <svg class="em-mt-0.5 em-h-5 em-w-5 em-shrink-0 em-text-[#9A6700]" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-2.505 3.423a11.115 11.115 0 0 1-.587-4.67h3.548a11.115 11.115 0 0 1-.587 4.67ZM8 1.5a8.158 8.158 0 0 0-1.735 4.306h3.47A8.158 8.158 0 0 0 8 1.5Z"/></svg>

      <div>
        <h3 class="em-text-sm em-font-bold em-text-[#1F2328]">Network Error Simulation</h3>
        <p class="em-mt-1 em-text-sm em-text-[#656D76]">
          This API will simulate a connection failure.
          <br>
          You can fine-tune the delay, failure probability, and timeout settings in the
          <a href="#" class="em-font-medium em-text-[#0969DA] em-underline em-decoration-1 hover:em-decoration-2">Network Tab</a>.
        </p>
      </div>
    </div>
  </div>

</div>
```

**实现说明**：
- 在Svelte中使用 `{#if mockType === 'businessError'}...{:else if mockType === 'success'}...{/if}` 条件渲染
- 3个场景使用不同的图标颜色（红色/绿色/黄色）区分状态

---

## 附录：Tab内容组织原则

### Gemini评价

**信息架构评分**: 9/10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐

> "Clear mental model. It separates When (Network), What (Response), and How (Advanced)."

**信息架构**：
- **Network Tab**: 何时触发（延迟、失败率、超时、离线）
- **Response Tab**: 返回什么（业务错误、成功、网络错误）
- **Advanced Tab**: 如何转换（字段删除）

### Tab状态样式（GitHub风格）

**Active Tab**：
```css
background: #F6F8FA;
color: #1F2328;
font-weight: 500;
```

**Inactive Tab**：
```css
color: #656D76;
font-weight: 500;

/* Hover */
&:hover {
  background: #F6F8FA;
  color: #1F2328;
}
```

---

## 完整HTML原型清单

本文档包含6个核心HTML原型：

1. **单选模式控制栏**（Tab Content顶部）
2. **批量模式上下文栏**（Tab Content顶部）
3. **Advanced Tab - Field Omission完整实现**
4. **Network Tab - 完整内容区**（新增）
5. **Response Tab - Business Error场景**（新增）
6. **Response Tab - Success/Network Error场景**（新增）

**总计**: 6个核心HTML原型，支持完整的Tab Content设计
