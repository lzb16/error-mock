# UI重构 - 待完成任务清单

> **当前状态**: Phase 1已完成，Svelte 5升级已回滚
> **分支**: feature/ui-refactor-tab-structure
> **工作目录**: /home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure
> **最后更新**: 2025-12-11

---

## 📊 Phase 1完成情况

**已完成的8个任务** ✅：

1. ✅ 创建目录结构（rule-editor/, modal/）
2. ✅ 实现ruleEditor Store（状态管理核心）
3. ✅ 实现Modal Header（单选/批量双模式）
4. ✅ 实现Modal Footer（条件显示）
5. ✅ 实现RuleControlBar（Tab导航+Mock Type+Enable）
6. ✅ 实现BatchControlBar（批量上下文栏）
7. ✅ 实现RuleEditor容器（508行→59行，88%缩减）
8. ✅ 重构FloatButton（侧边吸附+一体化拉伸）

**关键问题修复** ✅：
- ✅ 批量脏字段机制
- ✅ Modal集成新Header/Footer
- ✅ MIXED值支持
- ✅ updateDraft深度合并
- ✅ Tab切换策略文档化

**测试状态**: ✅ 311 passed, 1 skipped（97.8%通过率）

---

## ⏳ 待完成任务清单

### 优先级1：引入Melt UI组件库（立即）

**任务目标**: 使用Melt UI替换手写的复杂组件

**组件库决策**：
- ❌ Bits UI - 需要Svelte 5
- ❌ Ark UI - 需要Svelte 5（>=5.20.0）
- ✅ **Melt UI** - 支持Svelte 4（唯一可用）

**子任务**：

#### Task 1.1: 安装Melt UI
```bash
pnpm add @melt-ui/svelte --filter @error-mock/ui
```

**验收**: package.json中有@melt-ui/svelte依赖

---

#### Task 1.2: 重构RuleControlBar使用Melt UI Tabs

**当前实现**: 手写button切换（~30行）
**目标实现**: 使用Melt UI createTabs

**设计参考**: `docs/prototypes/03-tab-content-core.md` 第1章

**代码结构**:
```svelte
<script lang="ts">
  import { createTabs, melt } from '@melt-ui/svelte';
  import { editorUiState, setActiveTab, activeRuleDraft, updateDraft } from '../../stores/ruleEditor';

  const {
    elements: { root, list, trigger, content },
    states: { value }
  } = createTabs({
    defaultValue: $editorUiState.activeTab,
    onValueChange: ({ next }) => setActiveTab(next as 'network' | 'response' | 'advanced')
  });
</script>

<div class="em-shrink-0 em-border-b em-border-[#D0D7DE] em-bg-white em-px-6 em-py-3">
  <div class="em-flex em-items-center em-justify-between">

    <!-- Tabs（使用Melt UI） -->
    <nav use:melt={$list} class="em-flex em-gap-1">
      <button use:melt={$trigger('network')} class="em-rounded-md em-px-3 em-py-1.5 em-text-sm em-font-medium...">
        Network
      </button>
      <!-- 其他tabs -->
    </nav>

    <!-- Mock Type & Enable（保持手写） -->
    <div class="em-flex em-items-center em-gap-4">
      <!-- Mock Type下拉 -->
      <!-- Enable Toggle -->
    </div>
  </div>
</div>
```

**测试更新**:
- 更新RuleControlBar.test.ts适配Melt UI
- 验证键盘导航（Arrow keys, Home/End）
- 验证ARIA属性

**预计时间**: 20-30分钟

---

#### Task 1.3: （可选）重构Toggle使用Melt UI Switch

**当前实现**: 手写checkbox + 样式（~15行）
**目标实现**: 使用Melt UI createSwitch

**优先级**: 中（Toggle手写已经可用）

**预计时间**: 10-15分钟

---

### 优先级2：Sidebar重构（重要）

**任务目标**: 重构ApiList为ApiSidebar，添加全局状态栏

**当前问题**:
- ❌ 仍使用旧的ApiList.svelte（262行）
- ❌ 缺少全局状态栏（"3 Active" + Pause All + Settings）
- ❌ 批量操作工具栏设计未实现

**设计参考**: `docs/prototypes/02-layout-components.md` 第3章

---

#### Task 2.1: 创建ApiSidebar基础结构

**Files**:
- Create: `packages/ui/src/components/ApiSidebar.svelte`
- Create: `packages/ui/src/components/__tests__/ApiSidebar.test.ts`

**功能**:
- 顶部：Filter输入框 / 批量操作工具栏（条件切换）
- 中间：模块折叠 + API列表
- 底部：全局状态栏

**预计时间**: 30分钟

---

#### Task 2.2: 实现全局状态栏

**关键组件**（设计文档3.3节）：
```svelte
<div class="em-border-t em-border-[#D0D7DE] em-bg-white em-p-3">
  <!-- 状态指示器（脉冲动画） -->
  <div class="em-flex em-items-center em-gap-2">
    <span class="em-relative em-flex em-h-2.5 em-w-2.5">
      <!-- 绿色脉冲圆点 -->
    </span>
    <span class="em-text-sm em-font-semibold">3 Active</span>
  </div>

  <!-- Pause All + Settings按钮 -->
</div>
```

**预计时间**: 20分钟

---

#### Task 2.3: 集成ApiSidebar到Modal

**Files**:
- Modify: `packages/ui/src/App.svelte` - 替换ApiList为ApiSidebar
- Modify: `packages/ui/src/components/Modal.svelte` - 如需调整

**预计时间**: 10分钟

---

### 优先级3：Phase 2 - Tab内容实现（核心）

**任务目标**: 实现NetworkTab/ResponseTab/AdvancedTab的完整内容

**设计参考**:
- `docs/prototypes/03-tab-content-core.md` - Tab内容设计
- `docs/prototypes/04-forms.md` - 表单组件

---

#### Task 3.1: 实现NetworkTab

**Files**:
- Create: `packages/ui/src/components/rule-editor/tabs/NetworkTab.svelte`
- Create: `packages/ui/src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts`

**功能**（设计文档4章）：
- Delay输入框（ms单位）
- Failure Rate滑块（实时显示百分比）
- Timeout checkbox
- Offline checkbox

**关键实现**:
```svelte
<script>
  import { activeRuleDraft, updateDraft, markFieldDirty } from '../../stores/ruleEditor';

  function handleDelayChange(e) {
    const delay = parseInt(e.target.value);
    updateDraft({ network: { ...$activeRuleDraft.network, delay } });
    markFieldDirty('network.delay');
  }
</script>

<!-- Grid布局: grid-cols-[140px_1fr] -->
```

**测试覆盖**: ≥90%

**预计时间**: 1.5-2小时

---

#### Task 3.2: 实现ResponseTab

**Files**:
- Create: `packages/ui/src/components/rule-editor/tabs/ResponseTab.svelte`
- Create: `packages/ui/src/components/rule-editor/tabs/__tests__/ResponseTab.test.ts`
- Create: `packages/ui/src/components/rule-editor/forms/BusinessErrorForm.svelte`

**功能**（设计文档5章）：
- 场景A: Business Error配置表单
- 场景B: Success Info卡片
- 场景C: Network Error Info卡片
- 条件渲染：`{#if mockType === 'businessError'}`

**预计时间**: 2-2.5小时

---

#### Task 3.3: 实现AdvancedTab

**Files**:
- Create: `packages/ui/src/components/rule-editor/tabs/AdvancedTab.svelte`
- Create: `packages/ui/src/components/rule-editor/tabs/__tests__/AdvancedTab.test.ts`
- Create: `packages/ui/src/components/rule-editor/forms/ManualModeForm.svelte`

**功能**（设计文档3章）：
- Field Omission配置
- Manual模式表单（Tag列表）
- Random模式表单（Accordion折叠）

**如果使用Melt UI**:
- Accordion可用createAccordion

**预计时间**: 2-3小时

---

#### Task 3.4: 集成Tab内容到RuleEditor

**Files**:
- Modify: `packages/ui/src/components/rule-editor/RuleEditor.svelte`

**改动**:
```svelte
<!-- 替换占位符 -->
{#if $editorUiState.activeTab === 'network'}
  <NetworkTab />
{:else if $editorUiState.activeTab === 'response'}
  <ResponseTab />
{:else if $editorUiState.activeTab === 'advanced'}
  <AdvancedTab />
{/if}
```

**预计时间**: 15分钟

---

### 优先级4：测试问题修复（可选）

**任务目标**: 修复6个事件派发测试失败

**问题**: 测试使用了已废弃的`component.$on()` API

**解决方案**: 更新为callback props方式

**预计时间**: 30分钟

---

### 优先级5：Phase 3 - 体验优化（未来）

**等Phase 2完成后进行**：
- Tab验证状态（红点警告）
- 批量Apply逻辑完善
- GitHub Focus环样式统一
- 微交互优化（100ms反馈）

**预计时间**: 2-3天

---

## 📅 时间估算

| 任务 | 预计时间 | 累计 |
|------|---------|------|
| 引入Melt UI | 30-40分钟 | 0.5天 |
| Sidebar重构 | 1-1.5小时 | 0.7天 |
| NetworkTab | 1.5-2小时 | 0.9天 |
| ResponseTab | 2-2.5小时 | 1.2天 |
| AdvancedTab | 2-3小时 | 1.5天 |
| 集成Tab | 15分钟 | 1.5天 |
| 测试修复 | 30分钟（可选） | 1.6天 |
| **总计** | **~1.5-2天** | **完成Phase 2** |

---

## 🎯 下一步行动

**建议路径**：

**今天**：
1. 引入Melt UI（30分钟）
2. 开始Sidebar重构（1小时）

**明天**：
1. 完成Sidebar
2. 实现NetworkTab
3. 实现ResponseTab

**后天**：
1. 实现AdvancedTab
2. 集成所有Tab
3. 测试验证

---

## 📝 备注

**组件库决策**：
- 最终选择：**Melt UI**（唯一支持Svelte 4的headless库）
- Ark UI需要Svelte 5.20+
- Bits UI需要Svelte 5.33+
- Svelte 5升级尝试失败（大量测试兼容性问题）

**设计文档**：
- 所有设计原型已完成（54个HTML原型）
- 存储在：`docs/prototypes/`

**测试覆盖率目标**: ≥90%（所有新代码）

---

**文档版本**: v1.0
**创建日期**: 2025-12-11
**状态**: 待执行
