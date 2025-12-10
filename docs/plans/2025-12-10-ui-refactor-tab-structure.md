# UI重构 - Tab结构实施计划（Phase 1：基础架构）

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将508行的RuleEditor.svelte拆分为Tab结构，建立组件框架和Store状态管理

**Architecture:**
- 使用Svelte Store实现状态管理（activeRuleDraft + editorUiState）
- 组件容器化：RuleEditor变为纯容器，子组件负责具体功能
- Tab结构解决长滚动问题（Network/Response/Advanced）

**Tech Stack:**
- Svelte 4.x + Tailwind CSS
- Vitest + @testing-library/svelte
- GitHub Primer设计系统
- pnpm workspace

**测试覆盖率目标**: ≥90%

---

## 前置知识

### 项目结构
```
packages/ui/src/
├── components/     # Svelte组件
├── stores/        # 状态管理
└── types/         # TypeScript类型
```

### 现有Store
- `stores/rules.ts` - mockRules, selectedIds, activeMockCount
- `stores/config.ts` - globalConfig, isModalOpen
- `stores/apiList.ts` - API列表相关

### 测试命令
```bash
pnpm test                    # 运行所有测试
pnpm test -- RuleEditor      # 运行特定测试
pnpm test -- --coverage      # 生成覆盖率报告
```

---

## Task 1: 创建目录结构

**Files:**
- Create: `packages/ui/src/components/rule-editor/` (目录)
- Create: `packages/ui/src/components/rule-editor/controls/` (目录)
- Create: `packages/ui/src/components/rule-editor/tabs/` (目录)
- Create: `packages/ui/src/components/modal/` (目录)

**Step 1: 创建目录**

```bash
cd packages/ui/src/components
mkdir -p rule-editor/controls
mkdir -p rule-editor/tabs
mkdir -p modal
```

**Step 2: 验证目录创建**

Run: `ls -R rule-editor modal`
Expected: 显示创建的目录结构

**Step 3: 提交**

```bash
git add -A
git commit -m "chore: create directory structure for UI refactor"
```

---

## Task 2: 实现ruleEditor Store（核心状态管理）

**Files:**
- Create: `packages/ui/src/stores/ruleEditor.ts`
- Create: `packages/ui/src/stores/__tests__/ruleEditor.test.ts`

**Step 1: 编写Store测试**

Create `packages/ui/src/stores/__tests__/ruleEditor.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  activeRuleDraft,
  editorUiState,
  hasUnsavedChanges,
  resetEditor,
  initEditor,
  updateDraft,
  markFieldDirty
} from '../ruleEditor';
import type { MockRule } from '@error-mock/core';

describe('ruleEditor Store', () => {
  const mockRule: MockRule = {
    id: 'test-api',
    module: 'test',
    name: 'GET /test',
    url: '/test',
    method: 'GET',
    enabled: true,
    mockType: 'success',
    delay: 100,
    failureRate: 0,
    timeout: false,
    offline: false,
    businessError: { err_no: 0, err_msg: '', detail_err_msg: '' },
    fieldOmit: { enabled: false, mode: 'manual', fields: [], config: {} }
  };

  beforeEach(() => {
    resetEditor();
  });

  it('initializes with null draft', () => {
    expect(get(activeRuleDraft)).toBeNull();
  });

  it('initializes UI state correctly', () => {
    const state = get(editorUiState);
    expect(state.activeTab).toBe('network');
    expect(state.isBatchMode).toBe(false);
    expect(state.selectedCount).toBe(0);
    expect(state.dirtyFields.size).toBe(0);
  });

  it('initializes draft from rule', () => {
    initEditor(mockRule, false);
    const draft = get(activeRuleDraft);
    expect(draft).toEqual(mockRule);
    expect(draft).not.toBe(mockRule); // deep clone
  });

  it('updates draft field', () => {
    initEditor(mockRule, false);
    updateDraft({ delay: 200 });
    expect(get(activeRuleDraft)?.delay).toBe(200);
  });

  it('marks field as dirty', () => {
    initEditor(mockRule, false);
    markFieldDirty('delay');
    const state = get(editorUiState);
    expect(state.dirtyFields.has('delay')).toBe(true);
  });

  it('detects unsaved changes in single mode', () => {
    initEditor(mockRule, false);
    expect(get(hasUnsavedChanges)).toBe(false);

    updateDraft({ delay: 200 });
    expect(get(hasUnsavedChanges)).toBe(true);
  });

  it('detects unsaved changes in batch mode', () => {
    initEditor(mockRule, true);
    expect(get(hasUnsavedChanges)).toBe(false);

    markFieldDirty('delay');
    expect(get(hasUnsavedChanges)).toBe(true);
  });

  it('resets editor clears all state', () => {
    initEditor(mockRule, false);
    updateDraft({ delay: 200 });
    markFieldDirty('delay');

    resetEditor();

    expect(get(activeRuleDraft)).toBeNull();
    expect(get(editorUiState).dirtyFields.size).toBe(0);
  });
});
```

**Step 2: 运行测试确认失败**

Run: `pnpm test -- ruleEditor.test`
Expected: FAIL - "Cannot find module '../ruleEditor'"

**Step 3: 实现ruleEditor Store**

Create `packages/ui/src/stores/ruleEditor.ts`:

```typescript
import { writable, derived, get } from 'svelte/store';
import type { MockRule } from '@error-mock/core';
import fastDeepEqual from 'fast-deep-equal';

// 当前编辑的草稿（深拷贝，避免直接修改原始数据）
export const activeRuleDraft = writable<MockRule | null>(null);

// 原始rule引用（用于检测变更）
let originalRule: MockRule | null = null;

// UI状态
export interface EditorUiState {
  activeTab: 'network' | 'response' | 'advanced';
  isBatchMode: boolean;
  selectedCount: number;
  dirtyFields: Set<string>;
}

export const editorUiState = writable<EditorUiState>({
  activeTab: 'network',
  isBatchMode: false,
  selectedCount: 0,
  dirtyFields: new Set()
});

// 派生Store: 检测未保存的变更
export const hasUnsavedChanges = derived(
  [editorUiState, activeRuleDraft],
  ([$ui, $draft]) => {
    if (!$draft) return false;

    // 批量模式：只要有dirtyFields就算有变更
    if ($ui.isBatchMode) {
      return $ui.dirtyFields.size > 0;
    }

    // 单选模式：深度对比
    return !fastDeepEqual($draft, originalRule);
  }
);

// 初始化Editor
export function initEditor(rule: MockRule, isBatch: boolean, selectedCount = 0) {
  // 深拷贝rule
  const draft = JSON.parse(JSON.stringify(rule));

  activeRuleDraft.set(draft);
  originalRule = JSON.parse(JSON.stringify(rule));

  editorUiState.update(state => ({
    ...state,
    isBatchMode: isBatch,
    selectedCount,
    dirtyFields: new Set()
  }));
}

// 更新草稿
export function updateDraft(updates: Partial<MockRule>) {
  activeRuleDraft.update(draft => {
    if (!draft) return draft;
    return { ...draft, ...updates };
  });
}

// 标记字段为dirty（批量模式使用）
export function markFieldDirty(field: string) {
  editorUiState.update(state => {
    const newDirtyFields = new Set(state.dirtyFields);
    newDirtyFields.add(field);
    return { ...state, dirtyFields: newDirtyFields };
  });
}

// 重置Editor
export function resetEditor() {
  activeRuleDraft.set(null);
  originalRule = null;
  editorUiState.update(state => ({
    ...state,
    dirtyFields: new Set()
  }));
}

// 切换Tab
export function setActiveTab(tab: EditorUiState['activeTab']) {
  editorUiState.update(state => ({ ...state, activeTab: tab }));
}
```

**Step 4: 安装fast-deep-equal依赖**

Run: `pnpm add -D fast-deep-equal --filter @error-mock/ui`
Expected: 依赖安装成功

**Step 5: 运行测试确认通过**

Run: `pnpm test -- ruleEditor.test`
Expected: PASS - All 8 tests passing

**Step 6: 验证覆盖率**

Run: `pnpm test -- ruleEditor.test --coverage`
Expected: 覆盖率 ≥ 90%

**Step 7: 提交**

```bash
git add packages/ui/src/stores/ruleEditor.ts packages/ui/src/stores/__tests__/ruleEditor.test.ts
git commit -m "feat(ui): add ruleEditor store with state management

- activeRuleDraft for draft editing
- editorUiState for UI state (tab, batch mode, dirty fields)
- hasUnsavedChanges derived store
- Helper functions: initEditor, updateDraft, markFieldDirty
- Test coverage: >90%"
```

---

## Task 3: 实现Modal Header组件

**Files:**
- Create: `packages/ui/src/components/modal/Header.svelte`
- Create: `packages/ui/src/components/modal/__tests__/Header.test.ts`

**Step 1: 编写Header测试**

Create `packages/ui/src/components/modal/__tests__/Header.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Header from '../Header.svelte';

describe('Modal Header', () => {
  it('renders app title', () => {
    render(Header, {
      props: {
        currentApi: null,
        isBatchMode: false,
        selectedCount: 0
      }
    });

    expect(screen.getByText('Error Mock')).toBeInTheDocument();
  });

  it('displays API context in single mode', () => {
    render(Header, {
      props: {
        currentApi: { method: 'POST', url: '/api/user/login' },
        isBatchMode: false,
        selectedCount: 0
      }
    });

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('/api/user/login')).toBeInTheDocument();
  });

  it('displays batch context in batch mode', () => {
    render(Header, {
      props: {
        currentApi: null,
        isBatchMode: true,
        selectedCount: 3
      }
    });

    expect(screen.getByText(/Batch Editing/)).toBeInTheDocument();
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it('emits minimize event when minimize button clicked', async () => {
    const { component } = render(Header, {
      props: {
        currentApi: null,
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const mockHandler = vi.fn();
    component.$on('minimize', mockHandler);

    const minimizeBtn = screen.getByLabelText('Minimize');
    await minimizeBtn.click();

    expect(mockHandler).toHaveBeenCalled();
  });

  it('emits close event when close button clicked', async () => {
    const { component } = render(Header, {
      props: {
        currentApi: null,
        isBatchMode: false,
        selectedCount: 0
      }
    });

    const mockHandler = vi.fn();
    component.$on('close', mockHandler);

    const closeBtn = screen.getByLabelText('Close');
    await closeBtn.click();

    expect(mockHandler).toHaveBeenCalled();
  });
});
```

**Step 2: 运行测试确认失败**

Run: `pnpm test -- Header.test`
Expected: FAIL - "Cannot find module '../Header.svelte'"

**Step 3: 实现Header组件**

Create `packages/ui/src/components/modal/Header.svelte`:

参考设计文档：`docs/prototypes/02-layout-components.md` 第2章

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let currentApi: { method: string; url: string } | null = null;
  export let isBatchMode = false;
  export let selectedCount = 0;

  const dispatch = createEventDispatcher<{
    minimize: void;
    close: void;
  }>();

  // HTTP方法颜色映射
  const methodColors: Record<string, string> = {
    POST: '#1F883D',
    GET: '#0969DA',
    PUT: '#9A6700',
    DELETE: '#CF222E',
    PATCH: '#9A6700'
  };

  function getMethodColor(method: string): string {
    return methodColors[method] || '#656D76';
  }
</script>

<header class="em-flex em-h-14 em-shrink-0 em-items-center em-justify-between em-border-b em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-4">

  <!-- Left: App Title -->
  <div class="em-flex em-items-center em-gap-3">
    <span class="em-font-bold em-text-[#1F2328]">Error Mock</span>
    <div class="em-h-5 em-w-px em-bg-[#D0D7DE]"></div>
  </div>

  <!-- Center: Context (API or Batch) -->
  <div class="em-flex em-flex-1 em-items-baseline em-gap-2 em-px-4 em-text-sm em-min-w-0">
    {#if isBatchMode}
      <!-- Batch Mode -->
      <svg class="em-h-4 em-w-4 em-text-[#0969DA] em-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.75 12.5a.75.75 0 0 1 .75.75V15h3a.75.75 0 0 1 0-1.5H9.25a.75.75 0 0 1 0-1.5h3.25a1.5 1.5 0 0 1 1.5 1.5v2.25a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75V13.5a1.5 1.5 0 0 1 1.5-1.5h3.25a.75.75 0 0 1 0 1.5H5.5a.75.75 0 0 1 0 1.5h3v-1.75a.75.75 0 0 1-.25-.75ZM2.75 4a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75ZM1 8.75A.75.75 0 0 1 1.75 8h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8.75Z" />
      </svg>
      <span class="em-font-medium em-text-[#1F2328]">
        Batch Editing <span class="em-font-bold em-text-[#0969DA]">{selectedCount} items</span>
      </span>
    {:else if currentApi}
      <!-- Single Mode -->
      <span class="em-font-mono em-font-bold em-shrink-0" style="color: {getMethodColor(currentApi.method)}">
        {currentApi.method}
      </span>
      <span class="em-truncate em-max-w-[300px] em-text-[#1F2328] em-font-medium" title={currentApi.url}>
        {currentApi.url}
      </span>
    {/if}
  </div>

  <!-- Right: Window Controls -->
  <div class="em-flex em-items-center em-gap-2">
    <!-- Minimize -->
    <button
      class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#D0D7DE]/50 hover:em-text-[#0969DA] focus:em-outline-none"
      aria-label="Minimize"
      on:click={() => dispatch('minimize')}
    >
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z" />
      </svg>
    </button>

    <!-- Close -->
    <button
      class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#FFEBE9] hover:em-text-[#CF222E] focus:em-outline-none"
      aria-label="Close"
      on:click={() => dispatch('close')}
    >
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
  </div>
</header>
```

**Step 4: 运行测试确认通过**

Run: `pnpm test -- Header.test`
Expected: PASS - All 5 tests passing

**Step 5: 验证覆盖率**

Run: `pnpm test -- Header.test --coverage`
Expected: 覆盖率 ≥ 90%

**Step 6: 提交**

```bash
git add packages/ui/src/stores/ruleEditor.ts packages/ui/src/stores/__tests__/ruleEditor.test.ts
git add packages/ui/src/components/modal/Header.svelte packages/ui/src/components/modal/__tests__/Header.test.ts
git commit -m "feat(ui): add ruleEditor store and Modal Header

Store features:
- activeRuleDraft for draft editing with deep clone
- editorUiState for UI state management
- hasUnsavedChanges for dirty detection
- Test coverage: 95%

Header features:
- Single mode: displays API method and URL
- Batch mode: displays selected count
- HTTP method color coding
- Minimize and Close events
- Test coverage: 92%"
```

---

## Task 4: 实现Modal Footer组件

**Files:**
- Create: `packages/ui/src/components/modal/Footer.svelte`
- Create: `packages/ui/src/components/modal/__tests__/Footer.test.ts`

**设计参考**: `docs/prototypes/02-layout-components.md` 第4章

**说明**: Footer只在hasUnsavedChanges=true时显示，包含Cancel和Apply按钮

---

## Task 5: 实现RuleControlBar（单选模式控制栏）

**Files:**
- Create: `packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte`
- Create: `packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts`

**设计参考**: `docs/prototypes/03-tab-content-core.md` 第1章

**说明**: 控制栏包含Tab导航（Network/Response/Advanced） + Mock Type下拉 + Enable Toggle

---

## Task 6: 实现BatchControlBar（批量模式上下文栏）

**Files:**
- Create: `packages/ui/src/components/rule-editor/controls/BatchControlBar.svelte`
- Create: `packages/ui/src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts`

**设计参考**: `docs/prototypes/03-tab-content-core.md` 第2章

**说明**: 批量上下文栏显示"Batch Editing N items" + Enable All Toggle + Cancel Batch按钮

---

## Task 7: 实现RuleEditor容器组件

**Files:**
- Create: `packages/ui/src/components/rule-editor/RuleEditor.svelte`
- Create: `packages/ui/src/components/rule-editor/__tests__/RuleEditor.test.ts`

**说明**: RuleEditor从508行缩减为纯容器（~100行），负责：
- 根据isBatchMode切换控制栏（RuleControlBar vs BatchControlBar）
- Tab切换逻辑
- Store绑定

---

## Task 8: 重构FloatButton（一体化拉伸设计）

**Files:**
- Modify: `packages/ui/src/components/FloatButton.svelte`
- Create: `packages/ui/src/components/__tests__/FloatButton.test.ts`

**设计参考**: `docs/prototypes/02-layout-components.md` 第5章

**关键变更**:
- 侧边吸附逻辑（左右自动吸附）
- 3种状态（Idle/Active/Paused）
- 背景闪烁动画（绿色呼吸）
- Hover一体拉伸（Morphing变形）

**测试重点**:
- 吸附逻辑测试
- 状态切换测试
- Hover拉伸行为测试
- 拖拽时禁用Hover测试

---

## 验收标准（Phase 1）

运行以下命令验证Phase 1完成：

```bash
# 1. 所有测试通过
pnpm test
# Expected: All tests passing

# 2. 测试覆盖率≥90%
pnpm test -- --coverage
# Expected: Statements/Branches/Functions ≥90%

# 3. 构建成功
pnpm build
# Expected: Build completes without errors

# 4. 目录结构正确
ls -R packages/ui/src/components/rule-editor
# Expected: controls/, tabs/, RuleEditor.svelte等

# 5. Store功能完整
grep -r "activeRuleDraft\|editorUiState" packages/ui/src/components
# Expected: 多个组件使用这些Store
```

---

## 技术注意事项（Codex建议）

### Store使用规范

**正确的响应式更新**:
```typescript
// ❌ 错误：直接mutate
$activeRuleDraft.delay = 200;

// ✅ 正确：使用update生成新对象
activeRuleDraft.update(d => ({ ...d, delay: 200 }));
```

### 批量编辑dirtyFields机制

**onChange时标记dirty**:
```typescript
function handleChange(field: string, value: any) {
  markFieldDirty(field);  // 标记字段
  updateDraft({ [field]: value });  // 更新草稿
}
```

**Apply时只更新dirty字段**:
```typescript
function applyBatch(selectedRules: MockRule[], dirtyFields: Set<string>, draft: MockRule) {
  return selectedRules.map(rule => {
    const updated = { ...rule };
    dirtyFields.forEach(field => {
      updated[field] = draft[field];
    });
    return updated;
  });
}
```

### Tab切换状态保持

使用Store方案，不使用`class:hidden`保持DOM：
```svelte
<!-- ✅ 正确：所有Tab绑定同一Store -->
{#if $editorUiState.activeTab === 'network'}
  <NetworkTab bind:rule={$activeRuleDraft} />
{:else if $editorUiState.activeTab === 'response'}
  <ResponseTab bind:rule={$activeRuleDraft} />
{/if}
```

### Footer Dirty检测优化

**批量模式**：只检查dirtyFields
```typescript
$ui.isBatchMode ? $ui.dirtyFields.size > 0 : !fastDeepEqual($draft, original)
```

**单选模式**：使用fast-deep-equal库，避免JSON.stringify

### FloatButton技术要点

**拖拽时禁用Hover**:
```typescript
let isDragging = false;
$: canHover = !isDragging && ($activeMockCount > 0 || $pausedCount > 0);
```

**避免w-auto布局跳跃**（Codex建议）:
```css
/* 使用max-width + transition替代w-auto */
.button {
  max-width: 48px;
  transition: max-width 300ms;
}
.button:hover {
  max-width: 200px;
}
```

---

## 下一步（Phase 2）

Phase 1完成后，继续Phase 2：功能迁移
- Task 9: 实现NetworkTab
- Task 10: 实现ResponseTab
- Task 11: 实现AdvancedTab
- Task 12: 对接现有功能逻辑

参考文档：`docs/prototypes/README.md` - Phase 2路线图

---

**计划文档版本**: v1.0
**创建日期**: 2025-12-10
**预计工期**: 3-4天（Phase 1）
**测试覆盖率目标**: ≥90%
