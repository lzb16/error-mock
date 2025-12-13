# RuleEditor 重构设计方案（最终版）

> **版本**: v1.0
> **创建日期**: 2025-12-12
> **状态**: 📋 待实施
> **审核**: Codex + Gemini 联合审核通过

---

## 一、设计目标

### 核心原则

1. **简化配置模型**：移除 mockType 抽象，直接配置 HTTP 响应
2. **业务场景优先**：通过响应库快速配置常见业务异常
3. **全局网络控制**：统一的网络环境模拟
4. **所见即所得**：条件渲染，隐藏无效配置

### 关键改进

- ✅ 移除 mockType 选择器（success/businessError/networkError）
- ✅ 简化为 2 个 Tabs（Response + Network）
- ✅ 添加响应库（业务异常模板）
- ✅ 添加全局 Network Profile
- ✅ 统一命名格式（下划线：err_no, err_msg）

---

## 二、数据模型

### MockRule（重新设计）

```typescript
export interface MockRule {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  enabled: boolean;

  // Response 配置
  response: {
    status: number;           // HTTP 状态码（默认 200）

    // status=200 时的 ApiResponse 配置
    err_no: number;          // 业务错误码（0=成功）
    err_msg: string;         // 业务错误信息
    detail_err_msg: string;  // 详细错误信息
    result: unknown;         // 响应数据（填充到 ApiResponse.result）

    // status>=400 时的可选配置
    error_body?: unknown;    // 自定义错误响应体（可选）
  };

  // Network 配置
  network: {
    profile?: NetworkProfile | null;  // null=跟随全局
    custom_delay?: number;            // 自定义延迟（ms）
    error_mode?: 'timeout' | 'offline' | null;
    fail_rate?: number;               // 随机失败率（0-100）
  };
}

export type NetworkProfile = 'none' | 'fast4g' | 'slow3g' | '2g';

// Profile 延迟映射
const PROFILE_DELAYS = {
  none: 0,
  fast4g: 150,
  slow3g: 500,
  '2g': 1500,
};
```

### GlobalConfig（扩展）

```typescript
export interface GlobalConfig {
  // ... 现有字段
  network_profile: NetworkProfile; // 全局网络环境（默认 'none'）
}
```

### BusinessTemplate（响应库）

```typescript
export interface BusinessTemplate {
  id: string;
  name: string;              // "正常返回"、"余额不足"
  err_no: number;
  err_msg: string;
  detail_err_msg: string;
  result: unknown;
}

// 预设业务异常模板（硬编码）
const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'success',
    name: '正常返回',
    err_no: 0,
    err_msg: '',
    detail_err_msg: '',
    result: {},  // 空对象，用户可修改
  },
  {
    id: 'insufficient-balance',
    name: '余额不足',
    err_no: 1001,
    err_msg: '余额不足',
    detail_err_msg: '当前余额不足以完成此操作',
    result: null,
  },
  {
    id: 'permission-denied',
    name: '权限被拒',
    err_no: 1002,
    err_msg: '权限不足',
    detail_err_msg: '您没有执行此操作的权限',
    result: null,
  },
  {
    id: 'duplicate-order',
    name: '订单重复',
    err_no: 1003,
    err_msg: '订单已存在',
    detail_err_msg: '该订单号已被使用',
    result: null,
  },
];
```

---

## 三、UI 结构

### 整体布局

```
┌─────────────────────────────────────────────────────┐
│ [🪄] Error Mock Control Panel  [🌐 Fast 4G ▼] [×] │ ← Header（全局 Profile）
├─────────────────────────────────────────────────────┤
│ ApiList (1/3)      │ RuleEditor (2/3)               │
│                    │                                │
│ 🔍 Search APIs...  │ POST /api/storage/upload       │ ← Rule Info
│                    │                                │
│ STORAGE (3)        │ ☑ Enable Mocking              │ ← 总开关
│  POST uploadFile   │                                │
│  GET  listFiles    │ [Response] [Network]           │ ← 2 Tabs
│  DEL  deleteFile   │                                │
│                    │ ═══ Response Tab ═══           │
│ USER (3)           │                                │
│  GET  getUser      │ Status Code: [200 OK ▼]       │
│  POST login        │                                │
│  PUT  updateProfile│ (status=200 显示)              │
│                    │                                │
│                    │ 📚 Templates:                  │
│                    │ [正常返回] [余额不足]          │
│                    │ [权限拒] [订单重复]            │
│                    │                                │
│                    │ Business Error:                │
│                    │ err_no: [0]                   │
│                    │ err_msg: [  ]                 │
│                    │ detail_err_msg: [  ]          │
│                    │                                │
│                    │ Response Data (result):        │
│                    │ [JSON Editor]                  │
│                    │                                │
│                    │ (status>=400 显示)             │
│                    │ 💡 HTTP Error Mode             │
│                    │ 默认返回简单错误信息            │
│                    │                                │
│                    │ ═══ Network Tab ═══           │
│                    │                                │
│                    │ Delay:                         │
│                    │ ○ Follow Global (150ms)       │
│                    │ ● Override: [2G ▼]           │
│                    │   Custom: [____] ms           │
│                    │                                │
│                    │ Network Errors:                │
│                    │ ○ None                         │
│                    │ ○ Timeout                      │
│                    │ ○ Offline                      │
│                    │ ☐ Random (20%)                │
│                    │                                │
│                    │         [Cancel] [Apply]       │
└─────────────────────────────────────────────────────┘
```

---

## 四、Response Tab 详细设计

### 状态码选择区域

```html
<div className="em:p-4 em:bg-white em:border-b">
  <label className="em:text-sm em:font-medium em:text-gray-700 em:mb-2">
    HTTP Status Code
  </label>
  <select
    value={rule.response.status}
    onChange={(e) => handleStatusChange(parseInt(e.target.value))}
    className="em:w-full em:px-3 em:py-2 em:border em:rounded-md em:text-sm"
  >
    <option value="200">200 OK</option>
    <option value="201">201 Created</option>
    <option value="400">400 Bad Request</option>
    <option value="401">401 Unauthorized</option>
    <option value="403">403 Forbidden</option>
    <option value="404">404 Not Found</option>
    <option value="409">409 Conflict</option>
    <option value="500">500 Internal Server Error</option>
    <option value="502">502 Bad Gateway</option>
    <option value="503">503 Service Unavailable</option>
  </select>
</div>
```

### status=200 时的配置（完整）

```html
{rule.response.status === 200 && (
  <div className="em:p-6 em:space-y-6">

    {/* 业务异常模板 */}
    <div>
      <label className="em:text-sm em:font-medium em:mb-2">
        📚 Business Templates
      </label>
      <div className="em:grid em:grid-cols-2 em:gap-2">
        {BUSINESS_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template)}
            className="em:px-3 em:py-2 em:text-sm em:border em:rounded-md em:text-left hover:em:bg-blue-50"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>

    {/* Business Error 配置 */}
    <div>
      <label className="em:text-sm em:font-medium">Business Error</label>

      <div className="em:grid em:grid-cols-3 em:gap-3 em:mt-2">
        <div>
          <label className="em:text-xs em:text-gray-500">err_no</label>
          <input
            type="number"
            value={rule.response.err_no}
            className="em:w-full em:px-2 em:py-1 em:border em:rounded em:text-sm"
          />
          <p className="em:text-xs em:text-gray-400 em:mt-1">0=成功</p>
        </div>

        <div className="em:col-span-2">
          <label className="em:text-xs em:text-gray-500">err_msg</label>
          <input
            type="text"
            value={rule.response.err_msg}
            className="em:w-full em:px-2 em:py-1 em:border em:rounded em:text-sm"
          />
        </div>
      </div>

      <div className="em:mt-3">
        <label className="em:text-xs em:text-gray-500">detail_err_msg</label>
        <textarea
          value={rule.response.detail_err_msg}
          rows={2}
          className="em:w-full em:px-2 em:py-1 em:border em:rounded em:text-sm"
        />
      </div>
    </div>

    {/* Response Data (result) */}
    <div>
      <label className="em:text-sm em:font-medium em:mb-2">
        Response Data (result 字段)
      </label>
      <textarea
        value={JSON.stringify(rule.response.result, null, 2)}
        onChange={(e) => handleResultChange(e.target.value)}
        rows={10}
        className="em:w-full em:px-3 em:py-2 em:border em:rounded em:font-mono em:text-sm"
        placeholder="{}"
      />
      <p className="em:text-xs em:text-gray-500 em:mt-1">
        💡 最终返回：{"{"} err_no, err_msg, detail_err_msg, result, sync, time_stamp, trace_id {"}"}
      </p>
    </div>
  </div>
)}
```

### status>=400 时的配置（简化）

```html
{rule.response.status >= 400 && (
  <div className="em:p-6">
    <div className="em:bg-yellow-50 em:border em:border-yellow-200 em:rounded-lg em:p-4">
      <div className="em:flex em:items-start em:gap-3">
        <AlertTriangle className="em:w-5 em:h-5 em:text-yellow-600 em:shrink-0 em:mt-0.5" />
        <div>
          <h4 className="em:font-semibold em:text-yellow-900">HTTP Error Mode</h4>
          <p className="em:text-sm em:text-yellow-700 em:mt-1">
            将返回 HTTP {rule.response.status} 错误。
            前端通常不解析错误响应体，会直接进入 catch 或错误处理。
          </p>
        </div>
      </div>
    </div>

    {/* 可选：自定义错误响应体 */}
    <details className="em:mt-4">
      <summary className="em:text-sm em:font-medium em:cursor-pointer em:text-blue-600">
        Advanced: Custom Error Body
      </summary>
      <div className="em:mt-3">
        <textarea
          value={JSON.stringify(rule.response.error_body || {}, null, 2)}
          placeholder='{"error": "Not Found", "message": "..."}'
          rows={6}
          className="em:w-full em:px-3 em:py-2 em:border em:rounded em:font-mono em:text-sm"
        />
        <p className="em:text-xs em:text-gray-500 em:mt-1">
          留空则返回默认错误信息
        </p>
      </div>
    </details>
  </div>
)}
```

---

## 五、Network Tab 详细设计

### Delay 配置

```html
<div className="em:p-6 em:space-y-6">

  {/* Delay Configuration */}
  <div>
    <label className="em:text-sm em:font-medium em:mb-3">Delay Configuration</label>

    <label className="em:flex em:items-center em:gap-2 em:p-3 em:border em:rounded-lg em:cursor-pointer hover:em:bg-gray-50">
      <input
        type="radio"
        checked={!rule.network.profile}
        onChange={() => setDelayMode('global')}
      />
      <div className="em:flex-1">
        <div className="em:font-medium em:text-sm">Follow Global Network Profile</div>
        <div className="em:text-xs em:text-gray-500">
          Current: {globalConfig.network_profile} = {PROFILE_DELAYS[globalConfig.network_profile]}ms
        </div>
      </div>
    </label>

    <label className="em:flex em:items-center em:gap-2 em:p-3 em:border em:rounded-lg em:cursor-pointer hover:em:bg-gray-50 em:mt-2">
      <input
        type="radio"
        checked={!!rule.network.profile}
        onChange={() => setDelayMode('override')}
      />
      <div className="em:flex-1">
        <div className="em:font-medium em:text-sm">Override for this API</div>
      </div>
    </label>

    {rule.network.profile && (
      <div className="em:ml-6 em:mt-3 em:space-y-3">
        <div>
          <label className="em:text-xs em:text-gray-500">Network Profile</label>
          <select
            value={rule.network.profile}
            className="em:w-full em:px-3 em:py-2 em:border em:rounded-md em:text-sm"
          >
            <option value="none">None (0ms)</option>
            <option value="fast4g">Fast 4G (150ms)</option>
            <option value="slow3g">Slow 3G (500ms)</option>
            <option value="2g">2G (1500ms)</option>
          </select>
        </div>

        <div>
          <label className="em:text-xs em:text-gray-500">
            Or Custom Delay (ms)
          </label>
          <input
            type="number"
            value={rule.network.custom_delay || ''}
            placeholder="留空使用上方 Profile"
            className="em:w-full em:px-3 em:py-2 em:border em:rounded-md em:text-sm"
          />
        </div>
      </div>
    )}
  </div>

  {/* Network Errors */}
  <div>
    <label className="em:text-sm em:font-medium em:mb-3">Network Errors</label>

    <div className="em:space-y-2">
      <label className="em:flex em:items-center em:gap-2 em:p-2 em:cursor-pointer">
        <input
          type="radio"
          checked={!rule.network.error_mode}
          onChange={() => updateRule({ network: { error_mode: null } })}
        />
        <span className="em:text-sm">None (正常)</span>
      </label>

      <label className="em:flex em:items-center em:gap-2 em:p-2 em:cursor-pointer">
        <input
          type="radio"
          checked={rule.network.error_mode === 'timeout'}
          onChange={() => updateRule({ network: { error_mode: 'timeout' } })}
        />
        <div>
          <div className="em:text-sm em:font-medium">Timeout</div>
          <div className="em:text-xs em:text-gray-500">抛出 DOMException('TimeoutError')</div>
        </div>
      </label>

      <label className="em:flex em:items-center em:gap-2 em:p-2 em:cursor-pointer">
        <input
          type="radio"
          checked={rule.network.error_mode === 'offline'}
          onChange={() => updateRule({ network: { error_mode: 'offline' } })}
        />
        <div>
          <div className="em:text-sm em:font-medium">Offline</div>
          <div className="em:text-xs em:text-gray-500">抛出 TypeError('Failed to fetch')</div>
        </div>
      </label>
    </div>

    {/* Random Failure */}
    <div className="em:mt-4 em:pt-4 em:border-t">
      <label className="em:flex em:items-center em:gap-2 em:mb-3">
        <input
          type="checkbox"
          checked={(rule.network.fail_rate || 0) > 0}
          onChange={(e) => updateRule({
            network: { fail_rate: e.target.checked ? 20 : 0 }
          })}
        />
        <span className="em:text-sm em:font-medium">⚡ Random Network Failure</span>
      </label>

      {(rule.network.fail_rate || 0) > 0 && (
        <div className="em:ml-6">
          <div className="em:flex em:items-center em:gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={rule.network.fail_rate}
              className="em:flex-1"
            />
            <span className="em:text-sm em:font-mono em:font-bold">
              {rule.network.fail_rate}%
            </span>
          </div>
          <p className="em:text-xs em:text-gray-500 em:mt-1">
            触发时抛出 TypeError('Failed to fetch')
          </p>
        </div>
      )}
    </div>
  </div>
</div>
```

---

## 六、拦截器逻辑

```typescript
async function handleMock(
  rule: MockRule,
  globalConfig: GlobalConfig
): Promise<Response> {

  // 1. 计算延迟
  let delay = 0;
  if (rule.network.custom_delay !== undefined) {
    delay = rule.network.custom_delay;
  } else if (rule.network.profile) {
    delay = PROFILE_DELAYS[rule.network.profile];
  } else {
    delay = PROFILE_DELAYS[globalConfig.network_profile];
  }

  if (delay > 0) {
    await sleep(delay);
  }

  // 2. Network Error Mode
  if (rule.network.error_mode === 'timeout') {
    throw new DOMException('The operation timed out.', 'TimeoutError');
  }

  if (rule.network.error_mode === 'offline') {
    throw new TypeError('Failed to fetch');
  }

  // 3. Random Failure
  if (rule.network.fail_rate &&
      Math.random() * 100 < rule.network.fail_rate) {
    throw new TypeError('Failed to fetch');
  }

  // 4. 生成响应
  if (rule.response.status >= 400) {
    // HTTP 错误
    const body = rule.response.error_body || {
      error: getStatusText(rule.response.status),
      message: `HTTP ${rule.response.status}`,
    };

    return new Response(JSON.stringify(body), {
      status: rule.response.status,
      statusText: getStatusText(rule.response.status),
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // ApiResponse 结构（status=200-299）
    const apiResponse = {
      err_no: rule.response.err_no,
      err_msg: rule.response.err_msg,
      detail_err_msg: rule.response.detail_err_msg,
      result: rule.response.result,
      sync: true,
      time_stamp: Date.now(),
      time_zone_ID: 'Asia/Shanghai',
      time_zone_offset: -480,
      trace_id: generateTraceId(),
    };

    return new Response(JSON.stringify(apiResponse), {
      status: rule.response.status,
      statusText: getStatusText(rule.response.status),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

## 七、实施步骤

### Step 1: 更新数据模型

- [ ] 更新 `packages/core/src/types.ts` 的 MockRule
- [ ] 添加 response.status/err_no/err_msg/detail_err_msg/result
- [ ] 添加 network.profile/custom_delay/error_mode/fail_rate
- [ ] 移除 mockType、business、旧的 response 结构

### Step 2: 更新拦截器

- [ ] 修改 `packages/core/src/interceptor/fetch.ts` 的 handleMock
- [ ] 修改 `packages/core/src/interceptor/xhr.ts` 的对应逻辑
- [ ] 移除 mockType 判断分支
- [ ] 添加 status 判断（200 vs >=400）

### Step 3: 实现 Response Tab

- [ ] 创建新的 Response Tab 组件
- [ ] Status Code 下拉菜单
- [ ] 条件渲染（status=200 vs >=400）
- [ ] Business Error 表单（err_no/err_msg/detail_err_msg）
- [ ] Result JSON 编辑器
- [ ] 业务异常模板按钮

### Step 4: 实现 Network Tab

- [ ] Delay 配置（Follow Global 或 Override）
- [ ] Network Profile 选择
- [ ] Custom Delay 输入框
- [ ] Network Errors（timeout/offline/random）

### Step 5: 添加全局 Network Profile

- [ ] 更新 GlobalConfig 类型
- [ ] 在 Modal Header 添加 Profile 下拉菜单
- [ ] Store 持久化

### Step 6: 集成和测试

- [ ] 更新 useRulesStore 的 createDefaultRule
- [ ] 测试完整流程
- [ ] 验证数据保存和加载

---

## 八、默认值

```typescript
const DEFAULT_RULE: MockRule = {
  id: '',
  url: '',
  method: 'GET',
  enabled: true,
  response: {
    status: 200,
    err_no: 0,
    err_msg: '',
    detail_err_msg: '',
    result: {},
    error_body: undefined,
  },
  network: {
    profile: null,        // 跟随全局
    custom_delay: undefined,
    error_mode: null,
    fail_rate: 0,
  },
};
```

---

**这个设计方案你确认了吗？** 我可以开始实施了！