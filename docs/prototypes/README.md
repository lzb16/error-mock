# Error Mock Plugin UI 原型文档

> **版本**: v3.1 - 模块化设计文档（方案D + 第九轮补充）
> **更新日期**: 2025-12-10
> **设计师**: Gemini (Google AI，九轮审核)
> **状态**: ✅ 核心原型设计已完成

---

## 📁 文档结构（新版）

### 核心设计文档

- **01-design-system.md** (21KB) ✅ 已完成 - 设计系统规范
  - GitHub Primer配色/字体/间距
  - 基础组件库（按钮/输入框/卡片等）
  - 21个HTML样式组件（含状态与反馈组件）
  - ✅ 已完成，Gemini审核9/10评分

- **02-layout-components.md** (35KB) ✅ 已完成 - 布局与核心组件
  - Modal框架结构（三段式）
  - Header设计（单选+批量，2个完整原型）
  - Sidebar完整设计（11个原型：Filter/批量/模块/API项目/状态栏）
  - Footer设计（单选+批量，2个原型）
  - FloatButton设计（侧边吸附+一体化拉伸，6个原型）✅ 最终版
  - **总计**: 24个完整HTML原型

- **03-tab-content-core.md** (24KB) ✅ 已完成 - Tab内容设计
  - 控制栏（单选模式，1个原型）
  - 批量上下文栏（批量模式，1个原型）
  - Advanced Tab（Field Omission完整，1个原型）
  - Network Tab（完整内容区，1个原型）✅ 新增
  - Response Tab（3种场景，3个原型）✅ 新增
  - **总计**: 6个完整HTML原型

- **04-forms.md** (15KB) ✅ 已完成 - 表单组件库
  - 批量编辑表单（已完成，1个完整原型）
  - Field Omission - Manual Mode表单（已完成，1个原型）✅ 新增
  - Field Omission - Random Mode表单（参考03文档）
  - Business Error表单（集成到Response Tab）
  - Network Settings表单（集成到Network Tab）
  - **总计**: 3个独立表单原型 + 2个集成引用

### 审核历史

- **gemini-audit-log.md** (20KB) ✅ 已完成 - Gemini七轮完整审核记录
  - 设计演进路径（6.8/10 → 9/10）
  - 关键决策记录（7个重大决策）
  - 废弃设计归档（浮动Pill等）
  - 最终评分与批准

### HTML原型

- **ui-prototype-single.html** (36KB) - 单选模式完整原型
- **ui-prototype-batch.html** (19KB) - 批量模式完整原型

### 技术文档

- **ui-redesign-github-style.md** - 完整设计方案评审文档（Phase 1-3）
- **ui-redesign-review.md** - Gemini评审记录

---

## 📦 归档说明

### archive/ 目录

包含所有**第一版文档**（v2.0碎片化版本，13个文档，210KB）：

- 00-framework.md - 布局框架
- 01-design-specs.md - 设计规范（旧版）
- 02-header.md - Header组件（旧版）
- 03-sidebar.md - Sidebar组件（旧版）
- 04-tabs.md - Tab导航
- 05-footer-and-pill.md - Footer与Pill
- 06-gemini-review.md - 第1/2轮审核
- 07-changelog.md - 第2轮变更记录
- 08-status-pill-decision.md - 第3轮Pill决策
- 09-sidebar-advanced-features.md - 第4轮功能补充
- 10-final-summary.md - 前4轮总结
- 11-search-redundancy.md - 第5轮搜索冗余
- 12-batch-mode-design.md - 第6轮批量模式
- README.md - 旧版汇总文档

**归档原因**：
- 文档碎片化（13个独立文件）
- 信息重复（同一原型代码出现在多个文档）
- 难以维护（添加新组件需要更新多个文件）
- 未来扩展性差（单文件会膨胀到100KB+）

**归档时间**：2025-12-10
**保留期限**：建议保留1-2周后清理

---

## 🏗️ 组件目录结构规划

经过与Codex的技术讨论，确认的最终目录结构：

```
packages/ui/src/
├── components/
│   ├── App.svelte
│   ├── FloatButton.svelte
│   ├── Toast.svelte
│   ├── Modal.svelte
│   ├── ApiSidebar.svelte           # 重构自ApiList (与RuleEditor平级)
│   ├── BatchPanel.svelte
│   │
│   ├── modal/                       # Modal专属组件
│   │   ├── Header.svelte           # Modal Header (单选/批量双模式)
│   │   └── Footer.svelte           # Modal Footer (条件显示)
│   │
│   └── rule-editor/                 # 核心重构目录
│       ├── RuleEditor.svelte        # 容器组件 (~100行)
│       ├── TabContainer.svelte      # Tab内容包裹器
│       ├── BusinessErrorForm.svelte # 业务错误表单
│       │
│       ├── controls/                # 控制栏组件
│       │   ├── RuleControlBar.svelte    # 单选模式
│       │   └── BatchControlBar.svelte   # 批量模式
│       │
│       └── tabs/                    # Tab内容组件
│           ├── NetworkTab.svelte
│           ├── ResponseTab.svelte
│           └── AdvancedTab.svelte
│
└── stores/
    ├── config.ts
    ├── rules.ts
    ├── apiList.ts
    └── ruleEditor.ts                # 新增Editor状态管理
```

**关键设计决策**：
- ✅ `controls/` 目录（替代`headers/`，更准确）
- ✅ 移除`shared/`目录（组件直接平铺避免过度嵌套）
- ✅ `Header/Footer`放入`modal/`目录（专属于Modal）
- ✅ `ApiSidebar`与`RuleEditor`平级（全局导航组件）
- ✅ Store统一放在`stores/`根目录（保持一致性）

**目标**：
- 单文件不超过200行
- 目录层级不超过3层
- 组件职责清晰，易于维护

---

## 🎯 设计原则（Gemini七轮审核确认）

1. **Boxy布局** - 用边框界定区域，而非背景色
2. **高对比度、低饱和度** - 色彩仅用于状态
3. **微妙现代感** - Header微模糊、轻微阴影
4. **极快反馈** - 100ms过渡
5. **渐进式披露** - 核心可见，高级折叠
6. **信息密度平衡** - 紧凑但不拥挤
7. **无过度设计** - 简约专业
8. **控制邻近性** - 控制应在被控对象旁边
9. **结构一致性** - Header=框架，Tab Content=工作台

---

## ⭐ Gemini七轮审核亮点总结

### 评分演进
- 初版：6.8/10
- 第2轮：8.0/10（Header修复）
- 第4轮：8.7/10（功能补全）
- 第7轮：**9/10**（统一设计）

### 关键决策

| 轮次 | 核心问题 | 最终方案 |
|------|---------|---------|
| 第1轮 | Header拥挤 | API路径截断（Flexbox） |
| 第2轮 | 代码验证 | 响应式类名（xl: 2xl:） |
| 第3轮 | Status Pill可见性 | Sidebar全局状态栏 |
| 第4轮 | 缺少功能 | 模块折叠+批量操作 |
| 第5轮 | 双搜索冗余 | 移除Header搜索 |
| 第6轮 | 批量上下文冲突 | Tab Content批量上下文栏 |
| 第7轮 | 设计一致性 | **统一控制栏**（Header=框架，Tab Content=工作台） |

### 最终设计原则（第7轮确立）

**Header职责**：
- ✅ 显示上下文（What am I looking at?）
- ❌ 不包含控制（What can I do? → Tab Content）

**Tab Content职责**：
- ✅ 包含所有编辑控制
- ✅ 控制栏（单选）：Tabs + Mock Type + Enable
- ✅ 批量上下文栏（批量）：Batch标题 + Enable All

---

## 🚀 实施路线图（更新）

### Phase 1：基础架构（3-4天）✅ 原型设计已完成

**目标**: 建立组件框架和Store结构

- [ ] 创建 `components/rule-editor/` 目录结构
- [ ] 创建 `components/modal/` 目录
- [ ] 实现 `stores/ruleEditor.ts` (activeRuleDraft + editorUiState)
- [ ] 实现 `modal/Header.svelte` (单选/批量双模式)
- [ ] 实现 `modal/Footer.svelte` (条件显示)
- [ ] 实现 `controls/RuleControlBar.svelte`
- [ ] 实现 `controls/BatchControlBar.svelte`
- [ ] 重构 `ApiSidebar.svelte`
- [ ] 实现 `RuleEditor.svelte` 容器组件
- [ ] **测试**: Store单元测试 + 组件单元测试（覆盖率≥90%）

**验收标准**:
- ✅ 目录结构建立完成
- ✅ Tab切换功能正常
- ✅ 单选/批量模式切换正常
- ✅ 测试覆盖率≥90%

---

### Phase 2：功能迁移（4-5天）✅ 原型设计已完成

**目标**: 迁移现有功能到新Tab结构

- [ ] 实现 `tabs/NetworkTab.svelte` (使用完整HTML原型)
- [ ] 实现 `tabs/ResponseTab.svelte` (3种条件渲染场景)
- [ ] 实现 `tabs/AdvancedTab.svelte` (Field Omission + Manual Mode)
- [ ] 实现 `BusinessErrorForm.svelte`
- [ ] 对接Store: activeRuleDraft绑定
- [ ] 实现混合状态显示（批量模式）
- [ ] 实现dirtyFields追踪机制
- [ ] **测试**: 单元测试 + 集成测试（覆盖率≥90%）

**验收标准**:
- ✅ 所有Tab功能正常工作
- ✅ Tab切换不丢失数据
- ✅ Store绑定正确
- ✅ 测试覆盖率≥90%

---

### Phase 3：体验优化（2-3天）

**目标**: 完善交互和批量编辑逻辑

- [ ] 实现批量Apply逻辑（仅更新dirty字段）
- [ ] 实现Tab验证状态（红点警告）
- [ ] 应用GitHub Focus环样式
- [ ] 优化微交互（100ms hover反馈）
- [ ] 实现"Keep Original"逻辑
- [ ] **测试**: E2E测试 + 回归测试（覆盖率≥90%）

**验收标准**:
- ✅ 批量编辑逻辑正确
- ✅ UI细节完善
- ✅ 所有测试通过
- ✅ **整体测试覆盖率≥90%**

---

### Phase 4：全局功能（待规划）

**目标**: 配置导出/导入、Settings面板

- [ ] Settings面板设计
- [ ] 配置导出/导入功能
- [ ] 主题切换功能
- [ ] 文档: 创建`03-tab-settings.md`（如需要）

**注**: Settings面板设计待用户确认需求后再补充原型

---

## 🔄 更新日志

### 2025-12-10 - Gemini第九轮补充（FloatButton一体化拉伸设计）

**触发**: 用户提出一体化拉伸方案，用背景闪烁替代脉冲圆点

**审核结果**: 一体化拉伸胶囊设计完成

**设计方案**:
1. **侧边Tab标签样式** (02-layout-components.md 第5章)
   - 白底+灰边框，像浏览器原生UI
   - 紧凑胶囊造型（44px高 x 48px宽）
   - 统一使用beaker（烧杯）图标，4x4（16px）
   - 图标用7x7圆形容器包裹
   - Hover时一体拉伸到约200px

2. **吸附行为**
   - 左右方向：自动吸附到最近侧边
   - 上下方向：自由拖拽
   - 持久化：{ side: 'left' | 'right', y: number }

3. **状态指示**（背景闪烁）
   - 🟢 Active: 绿色背景闪烁（3s呼吸动画）+ 绿色侧边条
   - 🟡 Paused: 黄色背景静止 + 黄色侧边条（新增状态）
   - ⚪ Idle: 灰色背景静止 + 无侧边条
   - **去掉脉冲圆点**

4. **Hover一体拉伸**（仅Active/Paused）
   - 主按钮本身向内拉长（Morphing变形）
   - 显示：图标（固定） + 状态文字（两行） + 操作按钮
   - Idle状态不拉伸

**专家审核** (Gemini + Codex):
- Gemini评价："精致度满分，这是UI/UX的极简巅峰"
- Codex复杂度：5/10（可控）
- 推荐尺寸：44px高（iOS黄金触控尺寸）+ 16px图标（GitHub标准）

**用户决策**:
- ✅ 图标统一（beaker烧杯，4x4精致尺寸）
- ✅ 图标用圆形容器包裹（背景闪烁）
- ✅ 去掉脉冲圆点
- ✅ 精致尺寸（44px高 x 48px宽）
- ✅ 一体化拉伸（Morphing变形，非独立面板）
- ✅ 新增Paused状态（黄色）

**技术实施建议** (Codex):
- 实现复杂度：5/10（可控）
- 关键风险：拖拽/Hover冲突、w-auto布局跳跃、动画残留、展开溢出视口
- 对策：isDragging flag、transform替代width、状态机管理、opacity延迟
- 优化建议：使用transform/clip-path、预计算宽度、分离拖拽hitbox

**文档更新**:
- 02-layout-components.md: 从18个原型扩展至24个（+6个）
- 新增第5章：FloatButton组件（6个状态原型）
- 新增背景闪烁动画CSS规范
- 新增Codex技术实施建议

---

### 2025-12-10 - Gemini第九轮补充（Tab原型完成）

**触发**: 用户请求补充NetworkTab、ResponseTab、Manual Mode表单的HTML原型

**审核结果**: 3个完整HTML原型设计完成

**补充内容**:
1. **Network Tab完整设计** (03-tab-content-core.md 第4章)
   - Delay输入框（ms单位，右侧内嵌标识）
   - Failure Rate滑块（实时显示百分比Badge）
   - Timeout/Offline Toggle（标签+辅助说明）
   - Grid布局 `grid-cols-[140px_1fr]`

2. **Response Tab完整设计** (03-tab-content-core.md 第5章)
   - 场景A: Business Error配置表单
   - 场景B: Success Info卡片（引导到Advanced Tab）
   - 场景C: Network Error Info卡片（引导到Network Tab）
   - 条件渲染逻辑清晰

3. **Manual Mode Form完整设计** (04-forms.md 第3章)
   - Input Group（输入框+按钮）
   - Tag列表展示（Flex wrap布局）
   - 删除按钮交互（Hover变红）
   - Empty State（虚线边框+灰色文字）

**技术协作**:
- 与Codex讨论并确认组件目录结构
- 优化组件命名：`headers/` → `controls/`
- 确认Store结构和数据流方案
- 制定90%测试覆盖率策略

**文档更新**:
- 03-tab-content-core.md: 从3个原型扩展至6个（+200%）
- 04-forms.md: 从2个原型扩展至3个（+50%）
- README.md: 更新完成度、目录结构规划、实施路线图

**当前状态**:
- ✅ 所有核心原型设计已完成（54个）
- ✅ 组件目录结构已确认（Codex优化）
- ✅ 技术实施方案已明确
- ✅ FloatButton经Gemini+Codex联合审核通过
- 🚀 准备开始Phase 1代码实施

---

### 2025-12-10 - Gemini第八轮补充审核

**触发**: 用户请求Gemini对01-design-system整体规范进行完整性检查

**审核结果**: 9/10（高度全面）

**补充内容**（4个关键组件）:
1. **禁用状态**（Component 18） - Button/Input/Select的disabled样式规范
2. **加载状态**（Component 19） - GitHub风格Spinner与Loading按钮
3. **空状态**（Component 20） - 无结果/无规则的Empty State设计
4. **内联表单验证**（Component 21） - 错误/成功输入状态与验证时机

**延期至Phase 2的可选项**:
- Toast通知（Footer当前足够）
- 自定义Tooltip（原生title足够）
- 样式化滚动条（浏览器默认可接受）

**文档更新**:
- 01-design-system.md从17个组件扩展至21个
- 新增"状态与反馈组件"章节（230行代码）

---

## 📖 快速导航

### 查找设计规范
→ `01-design-system.md` - 21个基础组件样式

### 查找布局组件
→ `02-layout-components.md` - Header/Sidebar/Footer (18个原型)

### 查找Tab内容
→ `03-tab-content-core.md` - 控制栏/Network/Response/Advanced (6个原型)

### 查找表单组件
→ `04-forms.md` - 批量编辑/Manual Mode/集成表单 (3个原型)

### 查看审核历史
→ `gemini-audit-log.md` - 七轮完整审核记录
→ `archive/` - 第一版碎片文档

### 查看完整原型
→ `ui-prototype-single.html` - 单选模式完整可交互原型
→ `ui-prototype-batch.html` - 批量模式完整可交互原型

---

## 📊 HTML原型统计

### 按文档分布

| 文档 | 原型数量 | 状态 |
|------|---------|------|
| 01-design-system.md | 21个基础组件 | ✅ 完成 |
| 02-layout-components.md | 24个布局原型 | ✅ 完成 |
| 03-tab-content-core.md | 6个Tab原型 | ✅ 完成 |
| 04-forms.md | 3个表单原型 | ✅ 完成 |
| **总计** | **54个完整HTML原型** | ✅ 完成 |

### 按功能分类

| 功能模块 | 原型数量 | 说明 |
|---------|---------|------|
| 设计系统基础组件 | 21个 | Button/Input/Card/Badge/Toggle等 |
| Modal框架布局 | 6个 | Header(2) + Footer(2) + Modal容器(2) |
| Sidebar组件 | 8个 | Filter/批量工具栏/模块/API项目/状态栏 |
| FloatButton组件 | 6个 | 一体化拉伸胶囊（左右镜像 x 3状态）✅ 最终版 |
| Tab控制栏 | 2个 | 单选控制栏 + 批量上下文栏 |
| Tab内容区 | 4个 | Network + Response(3场景) |
| Field Omission | 2个 | Manual Mode + Random Mode |
| 批量编辑 | 1个 | 公共字段表单 |
| 状态组件 | 4个 | 禁用/加载/空状态/验证 |

---

## 📚 文档规模控制

### 设计目标

**单文件上限**：< 60KB
**总大小预测**：~300KB（所有功能完成后）

### 扩展策略

- 03文档如超过55KB → 拆分为core和settings
- 04文档如超过40KB → 拆分为basic和advanced
- 新增复杂功能 → 独立文档

---

## 🔗 参考资源

- **GitHub Primer**: https://primer.style/
- **Tailwind CSS**: https://tailwindcss.com/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Svelte**: https://svelte.dev/

---

## ✅ 当前状态总结

**设计阶段**: ✅ 已完成
- 54个完整HTML原型已设计完成
- 组件目录结构已确认（Gemini + Codex协作）
- 状态管理方案已明确（Store结构 + 数据流）
- 技术实施路线图已制定（Phase 1-4）
- FloatButton经Gemini+Codex联合审核评分：精致度满分/复杂度5-10

**下一步**: 🚀 开始Phase 1代码实施
- 创建分支: `feature/ui-refactor-tab-structure`
- 建立目录结构
- 实现Store和基础组件
- 编写单元测试（目标覆盖率≥90%）

**预计交付**:
- Phase 1-3: 10-12天
- Phase 4: 待定（需用户确认Settings面板需求）

---

**最后更新**: 2025-12-10
**文档版本**: v3.1
