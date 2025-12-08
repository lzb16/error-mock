# Error Mock Plugin Design

A frontend plugin for mocking network requests, simulating errors, and testing frontend robustness.

## Overview

**Plugin Name**: `error-mock-plugin`

**Purpose**: Development tool for simulating network errors, business errors, and field omissions to test frontend error handling and robustness.

**Environment**: Development only, completely removed in production builds.

---

## Core Features

| Feature | Description |
|---------|-------------|
| Network error simulation | Delay, timeout, offline, random failure (probability-based) |
| Business error simulation | Custom err_no, err_msg, detail_err_msg |
| Success response simulation | Custom result data |
| Field omission simulation | Manual specify or random delete fields |
| Auto API parsing | Parse src/api directory to generate rules |
| Custom adapter | Support different project API structures |
| Batch operations | Multi-select APIs for batch configuration |
| Config persistence | localStorage for rules, config file for global settings |

---

## Technical Choices

| Layer | Choice |
|-------|--------|
| Interception | XHR/Fetch hijacking |
| UI Framework | Svelte + Tailwind CSS |
| Build Plugins | Webpack (umi3) + Vite |
| Project Structure | pnpm monorepo |
| Testing | Vitest + Playwright, 90% coverage |
| Theme | Dark mode default, system preference sync |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Build Time                             │
├─────────────────────────────────────────────────────────────┤
│  Webpack/Vite Plugin                                        │
│  ├── API Parser (parse src/api directory)                   │
│  │   └── Adapter interface (customizable)                   │
│  ├── Generate API metadata JSON                             │
│  └── Inject runtime code (development only)                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Runtime                                │
├─────────────────────────────────────────────────────────────┤
│  Interceptor Layer                                          │
│  ├── XHR hijacking                                          │
│  ├── Fetch hijacking                                        │
│  └── Bypass list (CORS, streams, binary)                    │
├─────────────────────────────────────────────────────────────┤
│  Mock Engine                                                │
│  ├── Rule matcher (URL + Method)                            │
│  ├── Exception simulator (network/business/random)          │
│  ├── Response generator                                     │
│  └── Field omission processor                               │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (Svelte + Tailwind)                               │
│  ├── Dynamic pill button (draggable)                        │
│  ├── Config modal (glassmorphism)                           │
│  └── Minimize bar                                           │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                              │
│  ├── localStorage (rule configs)                            │
│  └── Config file (global settings, exportable)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Structures

### Mock Rule

```typescript
interface MockRule {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  enabled: boolean;

  mockType: 'none' | 'success' | 'businessError' | 'networkError';

  network: {
    delay: number;           // ms, 0 = no delay
    timeout: boolean;
    offline: boolean;
    failRate: number;        // 0-100 probability
  };

  business: {
    errNo: number;
    errMsg: string;
    detailErrMsg: string;
  };

  response: {
    useDefault: boolean;
    customResult: any;
  };

  fieldOmit: {
    enabled: boolean;
    mode: 'manual' | 'random';
    fields: string[];        // manual mode: field paths
    random: {
      probability: number;   // 0-100
      maxOmitCount: number;
      excludeFields: string[];   // protected fields
      depthLimit: number;        // max depth to traverse
      omitMode: 'delete' | 'undefined' | 'null';
      seed?: number;             // for reproducibility
    };
  };
}
```

### API Metadata

```typescript
interface ApiMeta {
  module: string;        // e.g., 'user', 'order'
  name: string;          // e.g., 'enableOos'
  url: string;
  method: string;
  requestType?: string;
  responseType?: string;
}
```

### Response Structure (Target API Format)

```typescript
interface ApiResponse<T> {
  err_no: number;
  err_msg: string;
  detail_err_msg: string;
  result: T;
  sync: boolean;
  time_stamp: number;
  time_zone_ID: string;
  time_zone_offset: number;
  trace_id: string;
}
```

### Global Config

```typescript
interface GlobalConfig {
  enabled: boolean;
  defaultDelay: number;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'dark' | 'light' | 'system';
  keyboardShortcuts: boolean;
}
```

---

## API Parsing & Adapter

### Target API Structure

```
src/api/
├── user/
│   ├── _interface.ts    # Type definitions
│   └── index.ts         # Request methods
├── order/
│   ├── _interface.ts
│   └── index.ts
└── storage/
    ├── _interface.ts
    └── index.ts
```

### API Definition Pattern

```typescript
// src/api/storage/index.ts
export const enableOosUrl = '/commands/enable_oos.action';
export const enableOos = createRequest<EnableOosResponse, EnableOosRequest>({
  url: enableOosUrl,
});
```

### Adapter Interface

```typescript
interface ApiAdapter {
  parse(apiDir: string): ApiMeta[];
}

// Built-in adapter parses createRequest pattern
const builtInAdapter: ApiAdapter = {
  parse(apiDir) {
    // 1. Scan module directories
    // 2. Read index.ts files
    // 3. Extract xxxUrl constants and createRequest calls via AST
    // 4. Return ApiMeta[]
  }
};

// Custom adapter usage
{
  adapter: (apiDir) => {
    // Custom parsing logic
    return [{ module: 'xxx', name: 'xxx', url: '/xxx', method: 'POST' }];
  }
}
```

---

## Interceptor Design

### XHR/Fetch Hijacking

```typescript
class MockInterceptor {
  private rules: Map<string, MockRule>;
  private bypassList: BypassConfig;

  install() {
    this.interceptXHR();
    this.interceptFetch();
  }

  private shouldBypass(url: string, method: string): boolean {
    // Check bypass list (CORS, external domains, streams)
    // Fast path when mocking is globally disabled
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      if (this.shouldBypass(url, method)) {
        return originalFetch.apply(this, [input, init]);
      }

      const rule = this.matchRule({ url, method });
      if (rule?.enabled) {
        return this.handleMock(rule);
      }
      return originalFetch.apply(this, [input, init]);
    };
  }
}
```

### Bypass Configuration

```typescript
interface BypassConfig {
  origins: string[];           // External domains to skip
  methods: string[];           // e.g., OPTIONS for CORS preflight
  contentTypes: string[];      // e.g., streams, binary
  urlPatterns: RegExp[];       // Custom skip patterns
}
```

### Safety Considerations

- Preserve AbortController semantics
- Handle CORS preflight (OPTIONS) requests
- Graceful fallback when cloning streams/binary fails
- Detect existing fetch polyfills to avoid double-patching
- Fast path when mock is disabled globally

---

## UI Design

### Float Button (Dynamic Pill)

```
Idle state:     [ 🔧 ]
Active state:   [ 🔴 3 Mocks Active ]
```

- Fixed position, draggable
- Expands to show active mock count
- Click to open modal with spring animation

### Modal Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 Error Mock                                        [−] [×]  │
├──────────────────────┬──────────────────────────────────────────┤
│  🔍 Search... (⌘K)   │  POST /commands/enable_oos.action       │
│  ☑ Select module     │  ──────────────────────────────────────  │
│  ────────────────    │                                          │
│  ▼ user (3)          │  ⏻ Enable Mock                           │
│    🟢 login          │                                          │
│    ⚪ logout         │  ┌─ Mock Type ─────────────────────────┐ │
│    🔴 getUserInfo    │  │ ○ Pass  ○ Success  ● BizError  ○ Net│ │
│                      │  └────────────────────────────────────┘  │
│  ▼ storage (8)       │                                          │
│    ☑ 🟢 enableOos    │  ┌─ Network ──────────────────────────┐  │
│    ☑ 🔴 disableOos   │  │ Delay: [___300] ms                 │  │
│    ☐ ⚪ getStatus    │  │ □ Timeout  □ Offline               │  │
│                      │  │ Random Fail: [__20] %              │  │
│                      │  └────────────────────────────────────┘  │
│                      │                                          │
│                      │  ┌─ Business Error ───────────────────┐  │
│                      │  │ err_no:  [___10001]                │  │
│                      │  │ err_msg: [token expired___]         │  │
│                      │  └────────────────────────────────────┘  │
│                      │                                          │
│                      │  ┌─ Field Omission ───────────────────┐  │
│                      │  │ ○ Off  ○ Manual  ● Random          │  │
│                      │  │ Probability: [__30]%  Max: [__3]   │  │
│                      │  │ Protected: err_no, err_msg         │  │
│                      │  │ Mode: [delete ▼]                   │  │
│                      │  └────────────────────────────────────┘  │
│──────────────────────┴──────────────────────────────────────────│
│  [Global Settings]                    [Export]    [Reset All]   │
└─────────────────────────────────────────────────────────────────┘
```

### Status Indicators

- 🟢 Green: Mock active (success response)
- 🔴 Red: Mock active (error response)
- ⚪ Gray: Passthrough (no mock)

### Batch Mode

When multiple APIs selected:
- Header shows "Editing 3 Endpoints"
- Inconsistent values show "Mixed" or `-`
- Apply button with undo toast

### Minimize Mode

Click `[-]` to collapse to bottom bar:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 3 Mocks Active    [Pause All]  [Open Panel]              │
└─────────────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Focus search |
| `↑ ↓` | Navigate list |
| `Space` | Toggle mock on/off |
| `Escape` | Close modal |

### Style Guidelines

- Dark theme default (follows system preference)
- Glassmorphism: `backdrop-blur-md` + `bg-slate-900/90`
- Subtle borders: `border-white/10`
- Micro-interactions: 150ms transitions
- Non-blocking backdrop: allow background interaction

---

## Project Structure

```
error-mock-plugin/
├── packages/
│   ├── core/                      # Core logic
│   │   ├── src/
│   │   │   ├── interceptor/
│   │   │   │   ├── xhr.ts
│   │   │   │   ├── fetch.ts
│   │   │   │   ├── bypass.ts
│   │   │   │   └── index.ts
│   │   │   ├── engine/
│   │   │   │   ├── matcher.ts
│   │   │   │   ├── response.ts
│   │   │   │   ├── network.ts
│   │   │   │   └── field-omit.ts
│   │   │   ├── storage/
│   │   │   │   ├── local.ts
│   │   │   │   └── config.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                        # Svelte + Tailwind
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── FloatButton.svelte
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── ApiList.svelte
│   │   │   │   ├── RuleEditor.svelte
│   │   │   │   ├── BatchPanel.svelte
│   │   │   │   └── MinimizeBar.svelte
│   │   │   ├── stores/
│   │   │   │   └── rules.ts
│   │   │   ├── App.svelte
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── parser/                    # API parser
│   │   ├── src/
│   │   │   ├── adapters/
│   │   │   │   └── default.ts
│   │   │   ├── ast.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── webpack-plugin/
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── vite-plugin/
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── examples/
│   ├── umi3-example/
│   └── vite-example/
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── vitest.config.ts
```

---

## Build Plugin Usage

### Webpack (umi3)

```typescript
// .umirc.ts
export default {
  chainWebpack(config) {
    config.plugin('error-mock').use(ErrorMockWebpackPlugin, [{
      apiDir: 'src/api',
      // Optional custom adapter
      adapter: (apiDir) => { /* ... */ },
    }]);
  },
};
```

### Vite

```typescript
// vite.config.ts
export default {
  plugins: [
    errorMockVitePlugin({
      apiDir: 'src/api',
    }),
  ],
};
```

---

## Error Handling

| Scenario | Strategy |
|----------|----------|
| API file syntax error | Skip file, console warning |
| localStorage corrupted | Auto reset, notify user |
| Invalid rule config | Use defaults, mark warning |
| Field path not found | Silent skip |
| Plugin error | Catch and fallback, don't block business code |

**Core Principle**: Plugin errors must never affect business code execution.

---

## Testing Strategy

### Coverage Requirements

```typescript
// vitest.config.ts
{
  coverage: {
    thresholds: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    }
  }
}
```

### Test Structure

```
tests/
├── unit/                    # Vitest
│   ├── core/
│   │   ├── matcher.test.ts
│   │   ├── response.test.ts
│   │   ├── field-omit.test.ts
│   │   └── network.test.ts
│   └── parser/
│       └── adapter.test.ts
│
├── integration/             # Playwright
│   ├── interceptor.test.ts
│   ├── ui.test.ts
│   └── e2e.test.ts
│
└── examples/                # Real project verification
    ├── umi3-example/
    └── vite-example/
```

### Key Test Cases

- URL matching with path parameters
- Field random omission respects maxOmitCount
- Network delay + timeout combination
- Business error code response
- Batch config with mixed values
- Bypass list for external domains

---

## Data Flow

```
Page Load
    │
    ▼
Runtime Init
    ├──▶ 1. Read ApiMeta[]
    ├──▶ 2. Read localStorage rules
    ├──▶ 3. Merge to MockRule[]
    ├──▶ 4. Install XHR/Fetch interceptors
    └──▶ 5. Mount float button

Request Flow
    │
    ▼
XHR/Fetch Interceptor
    │
    ▼
Bypass Check ──(bypass)──▶ Original Request
    │
    │ (intercept)
    ▼
Rule Matcher ──(no match)──▶ Original Request
    │
    │ (matched)
    ▼
Delay Processor
    │
    ▼
Network Error Check ──(error)──▶ Trigger Network Error
    │
    │ (ok)
    ▼
Response Generator
    │
    ▼
Field Omission Processor
    │
    ▼
Return Mock Response
```

---

## Security Considerations

1. **Production removal**: Gate all code behind `process.env.NODE_ENV !== 'production'`
2. **Origin isolation**: Default to same-origin only, external domains require explicit config
3. **Config export**: Sanitize exported configs, no sensitive data
4. **Trace logging**: Add trace_id to mock responses for debugging
5. **Scoped styles**: Namespace Tailwind to avoid style leakage

---

## Implementation Phases

### Phase 1: Core
- [ ] Interceptor (XHR + Fetch)
- [ ] Mock engine (matcher, response generator)
- [ ] Field omission processor
- [ ] Storage layer

### Phase 2: Parser
- [ ] Built-in adapter for createRequest pattern
- [ ] AST parsing utilities
- [ ] Watch mode for file changes

### Phase 3: UI
- [ ] Float button (dynamic pill)
- [ ] Config modal
- [ ] Rule editor
- [ ] Batch panel
- [ ] Minimize bar

### Phase 4: Build Plugins
- [ ] Webpack plugin
- [ ] Vite plugin
- [ ] Runtime injection

### Phase 5: Testing & Examples
- [ ] Unit tests (90% coverage)
- [ ] Integration tests
- [ ] umi3 example project
- [ ] Vite example project

---

## Appendix: Svelte Component Examples

### Draggable Float Button

```svelte
<script>
  import { spring } from 'svelte/motion';

  export let activeMockCount = 0;
  export let onClick;

  const coords = spring(
    { x: window.innerWidth - 80, y: window.innerHeight - 80 },
    { stiffness: 0.1, damping: 0.25 }
  );

  let isDragging = false;

  function handleMousedown(e) {
    isDragging = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = $coords.x;
    const initialY = $coords.y;

    function handleMousemove(e) {
      coords.set({
        x: initialX + (e.clientX - startX),
        y: initialY + (e.clientY - startY)
      });
    }

    function handleMouseup() {
      isDragging = false;
      window.removeEventListener('mousemove', handleMousemove);
      window.removeEventListener('mouseup', handleMouseup);
    }

    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseup);
  }
</script>

<button
  class="fixed z-[9999] flex items-center gap-2 rounded-full bg-slate-800
         px-3 py-2 text-white shadow-lg transition-all hover:bg-slate-700"
  style="left: {$coords.x}px; top: {$coords.y}px;"
  on:mousedown={handleMousedown}
  on:click={() => !isDragging && onClick()}
>
  <span class="text-lg">🔧</span>
  {#if activeMockCount > 0}
    <span class="flex items-center gap-1 text-sm">
      <span class="h-2 w-2 rounded-full bg-red-500"></span>
      {activeMockCount} Active
    </span>
  {/if}
</button>
```

### Modal with Glassmorphism

```svelte
<div class="fixed inset-0 z-[9998] flex items-center justify-center">
  <!-- Backdrop (non-blocking) -->
  <div class="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none"></div>

  <!-- Modal -->
  <div class="relative flex h-[600px] w-[900px] overflow-hidden rounded-xl
              border border-slate-700 bg-slate-900/95 text-slate-200 shadow-2xl">
    <!-- Left Panel -->
    <aside class="w-1/3 border-r border-slate-700 flex flex-col">
      <!-- Search -->
      <div class="p-3 border-b border-slate-700">
        <input
          type="text"
          placeholder="Search... (⌘K)"
          class="w-full rounded bg-slate-800 px-3 py-1.5 text-sm"
        />
      </div>
      <!-- API List -->
      <div class="flex-1 overflow-y-auto p-2">
        <!-- ... -->
      </div>
    </aside>

    <!-- Right Panel -->
    <main class="flex-1 flex flex-col">
      <!-- ... -->
    </main>
  </div>
</div>
```
