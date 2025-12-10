# 表单组件库

> **文档说明**: 本文档整合所有表单组件设计
> **HTML原型总数**: 3个完整代码块（新增1个）
> **设计来源**: Gemini (Google AI) 第六轮、第九轮审核
> **最后更新**: 2025-12-10
> **状态**: ✅ 核心表单原型已完成

---

## 第1章：批量编辑表单

### 1.1 设计原则

**只包含公共字段**：
- ✅ Mock Type（统一类型）
- ✅ Delay（统一延迟）
- ✅ Failure Rate（统一失败率）
- ✅ Timeout/Offline（统一网络设置）

**不包含特定字段**：
- ❌ Business Error详情（err_no/err_msg各不同）
- ❌ 自定义响应体
- ❌ Field Omission配置

### 1.2 完整HTML原型

```html
<!-- BATCH EDIT FORM (Scrollable Content Area) -->
<form class="em-space-y-6 em-p-6">

  <!-- Section 1: Common Settings -->
  <div class="em-space-y-4">
    <h3 class="em-text-[11px] em-font-bold em-uppercase em-tracking-wider em-text-[#656D76]">
      Common Settings
    </h3>

    <!-- Mock Type -->
    <div class="em-grid em-grid-cols-[140px_1fr] em-gap-4 em-items-center">
      <label class="em-text-sm em-font-medium em-text-[#1F2328]" for="batch-mock-type">
        Mock Type
      </label>
      <div class="em-relative">
        <select
          id="batch-mock-type"
          class="em-w-full em-appearance-none em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-1.5 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none"
        >
          <option value="no_change" class="em-text-gray-500">(Keep Original)</option>
          <option value="networkError">Network Error</option>
          <option value="businessError">Business Error</option>
          <option value="success">Success</option>
          <option value="none">None</option>
        </select>
        <!-- Custom Arrow -->
        <svg class="em-pointer-events-none em-absolute em-right-3 em-top-2.5 em-h-3 em-w-3 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 5.22a.75.75 0 0 1 1.06 0L8 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 6.28a.75.75 0 0 1 0-1.06Z"/></svg>
      </div>
    </div>

    <!-- Delay -->
    <div class="em-grid em-grid-cols-[140px_1fr] em-gap-4 em-items-center">
      <label class="em-text-sm em-font-medium em-text-[#1F2328]" for="batch-delay">
        Delay (ms)
      </label>
      <input
        type="number"
        id="batch-delay"
        placeholder="(Keep Original)"
        class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-1.5 em-text-sm em-text-[#1F2328] placeholder:em-text-[#656D76] focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none"
      >
    </div>

    <!-- Failure Rate -->
    <div class="em-grid em-grid-cols-[140px_1fr] em-gap-4 em-items-center">
      <label class="em-text-sm em-font-medium em-text-[#1F2328]">
        Failure Rate
      </label>
      <div class="em-flex em-items-center em-gap-3">
        <input
          type="range"
          min="0" max="1" step="0.1"
          class="em-h-1.5 em-flex-1 em-cursor-pointer em-appearance-none em-rounded-lg em-bg-[#D0D7DE] em-accent-[#0969DA]"
        >
        <span class="em-w-16 em-text-right em-text-xs em-text-[#656D76]">(Mixed)</span>
      </div>
    </div>

    <!-- Toggles (Timeout / Offline) -->
    <div class="em-grid em-grid-cols-[140px_1fr] em-gap-4 em-items-start em-pt-2">
      <span class="em-text-sm em-font-medium em-text-[#1F2328] em-pt-0.5">Network</span>
      <div class="em-space-y-3">
        <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
          <input type="checkbox" class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30">
          <span class="em-text-sm em-text-[#1F2328]">Timeout</span>
        </label>
        <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
          <input type="checkbox" class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30">
          <span class="em-text-sm em-text-[#1F2328]">Offline</span>
        </label>
      </div>
    </div>
  </div>

  <!-- Warning Box -->
  <div class="em-rounded-md em-border em-border-yellow-200 em-bg-yellow-50 em-p-4">
    <div class="em-flex em-gap-3">
      <svg class="em-mt-0.5 em-h-4 em-w-4 em-shrink-0 em-text-[#9A6700]" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
      </svg>
      <div>
        <h4 class="em-text-sm em-font-bold em-text-[#9A6700]">Limited Batch Capability</h4>
        <p class="em-mt-1 em-text-xs em-text-[#9A6700]">
          Business Error details (error code, message) and custom Response Data cannot be batch edited as they are unique to each API rule.
        </p>
      </div>
    </div>
  </div>

</form>
```

### 1.3 限制说明（Warning Box）

**显示内容**：
> "Business Error details (error code, message) and custom Response Data cannot be batch edited as they are unique to each API rule."

**设计颜色**：
- **背景**: `bg-yellow-50`（浅黄色）
- **边框**: `border-yellow-200`
- **文字**: `text-[#9A6700]`（GitHub Yellow）
- **图标**: Warning triangle（GitHub Octicon）

### 1.4 表单布局

**Grid布局**：`grid-cols-[140px_1fr]`
- 左侧：140px固定宽度标签
- 右侧：剩余空间输入框

**混合状态显示**：
- **占位符**: `"(Keep Original)"`（不改变原值）
- **滑块提示**: `"(Mixed)"`（选中的API值不同）

---

## 第2章：Field Omission表单

### 2.1 Manual Mode Form

**TODO**: 提取或Phase 1补充

**预期内容**：
- 手动指定要删除的字段路径
- 支持嵌套路径（如`user.profile.avatar`）
- 字段列表（可添加/删除）

**预期HTML结构**：
```html
<!-- Manual Mode配置 -->
<div class="em-space-y-4">
  <h3>Manual Field Selection</h3>

  <!-- Field Path Input -->
  <div>
    <label>Field Path</label>
    <input type="text" placeholder="user.profile.avatar" />
  </div>

  <!-- Field List -->
  <div>
    <h4>Fields to Omit (3)</h4>
    <ul>
      <li>user.id <button>Remove</button></li>
      <li>created_at <button>Remove</button></li>
      <li>updated_at <button>Remove</button></li>
    </ul>
  </div>

  <button>Add Field</button>
</div>
```

### 2.2 Random Mode Form

**已设计完成** - 见第3章（03-tab-content-core.md）Advanced Tab

**内容**：
- Omission Probability（滑块）
- Omission Mode（Value/Key按钮组）
- Accordion: Constraints（Max Count, Max Depth, Seed）
- Accordion: Exceptions（Excluded Fields）

**引用**：完整HTML见 `/home/arsenal/code/error-mock-test/docs/prototypes/03-tab-content-core.md` 第3.1节

---

## 第3章：Manual Mode Form (Field Omission)

### 3.1 设计思路

**功能需求**:
- 手动指定要删除的字段路径
- 支持嵌套路径（点号分隔，如`user.profile.avatar`）
- 字段列表用Tag样式显示（可删除）
- 列表为空时显示Empty State

### 3.2 完整HTML原型

```html
<!-- MANUAL MODE FORM (Inside Advanced Tab) -->
<div class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-p-4">

  <div class="em-space-y-4">

    <!-- Input Group -->
    <div>
      <label class="em-mb-1.5 em-block em-text-xs em-font-semibold em-text-[#1F2328]">
        Add Field to Omit
      </label>
      <div class="em-flex em-gap-2">
        <input
          type="text"
          placeholder="e.g. user.profile.avatar"
          class="em-w-full em-flex-1 em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-1.5 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        >
        <button
          type="button"
          class="em-shrink-0 em-rounded-md em-bg-[#F6F8FA] em-px-3 em-py-1.5 em-text-sm em-font-medium em-text-[#1F2328] em-border em-border-[#D0D7DE] em-shadow-sm hover:em-bg-[#F3F4F6] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        >
          Add Field
        </button>
      </div>
      <p class="em-mt-1 em-text-xs em-text-[#656D76]">Use dot notation for nested fields.</p>
    </div>

    <!-- Field List (Tags) -->
    <div class="em-min-h-[60px] em-rounded-md em-border em-border-dashed em-border-[#D0D7DE] em-bg-[#F6F8FA] em-p-3">

      <!-- State A: Has Items -->
      <div class="em-flex em-flex-wrap em-gap-2">

        <!-- Tag Item 1 -->
        <span class="em-inline-flex em-items-center em-rounded-full em-border em-border-[#D0D7DE] em-bg-white em-px-2.5 em-py-0.5 em-text-xs em-font-medium em-text-[#1F2328]">
          user.password
          <button type="button" class="em-ml-1.5 em-text-[#656D76] hover:em-text-[#CF222E] focus:em-outline-none" aria-label="Remove user.password">
            <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
          </button>
        </span>

        <!-- Tag Item 2 -->
        <span class="em-inline-flex em-items-center em-rounded-full em-border em-border-[#D0D7DE] em-bg-white em-px-2.5 em-py-0.5 em-text-xs em-font-medium em-text-[#1F2328]">
          meta.internal_id
          <button type="button" class="em-ml-1.5 em-text-[#656D76] hover:em-text-[#CF222E] focus:em-outline-none" aria-label="Remove meta.internal_id">
            <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
          </button>
        </span>

      </div>

      <!-- State B: Empty (Hidden in State A) -->
      <div class="em-flex em-h-full em-items-center em-justify-center em-hidden">
        <span class="em-text-xs em-italic em-text-[#656D76]">
          No fields selected. Add a field path above.
        </span>
      </div>

    </div>

  </div>
</div>
```

**设计要点**：
- **Input Group**：输入框+按钮紧密组合
- **Tag列表**：Flex wrap布局,支持多行
- **删除按钮**：Hover变红色,清晰的视觉反馈
- **Empty State**：使用柔和的灰色和斜体文字
- **虚线边框**：`border-dashed`区分输入区域和展示区域

---

## 第4章：Business Error Form（集成到Response Tab）

### 4.1 集成说明

Business Error Form已集成到Response Tab（见 `03-tab-content-core.md` 第5.2节）

**触发条件**: `mockType === 'businessError'`

**包含字段**：
- Error Code (err_no) - 数字输入
- Error Message (err_msg) - 短文本输入
- Details (detail_err_msg) - 多行文本输入(3行)

**完整HTML原型**: 请参考 `03-tab-content-core.md` 第5.2节

---

## 第5章：Network Settings Form（集成到Network Tab）

### 5.1 集成说明

Network Settings Form已集成到Network Tab（见 `03-tab-content-core.md` 第4章）

**包含字段**：
- Delay (ms) - 数字输入
- Failure Rate - 滑块(0-1)
- Simulate Timeout - Checkbox
- Simulate Offline - Checkbox

**完整HTML原型**: 请参考 `03-tab-content-core.md` 第4章

---

## 附录：表单设计原则

### GitHub Primer风格

**表单元素统一样式**：
- **输入框**: `rounded-md border border-[#D0D7DE] bg-white px-3 py-1.5`
- **Focus态**: `focus:border-[#0969DA] focus:ring-2 focus:ring-[#0969DA]/30`
- **Placeholder**: `placeholder:text-[#656D76]`
- **标签**: `text-sm font-medium text-[#1F2328]`

### 批量编辑特殊处理

**保持原值选项**：
- Select: `<option value="no_change">(Keep Original)</option>`
- Input: `placeholder="(Keep Original)"`

**混合状态指示**：
- 当选中的API值不同时显示`"(Mixed)"`
- 用户修改后覆盖所有选中项

### 可访问性

**ARIA标签**：
- 所有输入框有`label`或`aria-label`
- Checkbox有明确的文字标签
- Warning Box有语义化的heading

**键盘导航**：
- Tab流程清晰
- Focus环明显
- 表单可完全用键盘操作

---

## 完整HTML原型清单

本文档包含3个完整HTML原型：

1. **批量编辑表单**（公共字段only）
2. **Field Omission - Random Mode表单**（见03-tab-content-core.md）
3. **Field Omission - Manual Mode表单**（新增）

**集成到其他Tab的表单**:
- Business Error表单 → Response Tab（见03-tab-content-core.md 第5.2节）
- Network Settings表单 → Network Tab（见03-tab-content-core.md 第4章）

**总计**: 3个独立表单原型 + 2个集成表单引用
