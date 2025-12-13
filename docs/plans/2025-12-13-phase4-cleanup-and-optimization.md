# Phase 4: Cleanup and Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete React migration by removing Svelte dependencies, cleaning up old code, and optimizing the build.

**Architecture:** Remove all Svelte-related code and dependencies while ensuring React version is production-ready. Update build configuration to only build React version.

**Tech Stack:** React 18, TypeScript, Vite, pnpm workspaces

---

## Task 1: Audit Current Codebase

**Files:**
- Analyze: `packages/ui/package.json`
- Analyze: `packages/ui/src/` directory structure

### Step 1: List all Svelte files in src/

**Command:**
```bash
find packages/ui/src -name "*.svelte" -type f
```

**Expected:** List of .svelte component files

### Step 2: List all Svelte-related dependencies

**Command:**
```bash
cat packages/ui/package.json | grep -E "svelte|melt-ui"
```

**Expected:** Dependencies like svelte, @melt-ui/svelte, svelte-preprocess, etc.

### Step 3: Check build configurations

**Command:**
```bash
ls packages/ui/vite*.config.ts
```

**Expected:**
- vite.config.ts (Svelte build)
- vite.react.config.ts (React build)

### Step 4: Document findings

Create a checklist of what needs to be removed:
- [ ] .svelte component files
- [ ] Svelte dependencies in package.json
- [ ] vite.config.ts (Svelte build config)
- [ ] Svelte-related imports in index.ts

---

## Task 2: Remove Svelte Component Files

**Files:**
- Delete: All `packages/ui/src/components/**/*.svelte` files
- Delete: All `packages/ui/src/stores/**/*.svelte` files (if any)
- Keep: `packages/ui/src/react/` directory (React version)

### Step 1: Create backup list of Svelte files

**Command:**
```bash
find packages/ui/src -name "*.svelte" -type f > /tmp/svelte-files-to-delete.txt
cat /tmp/svelte-files-to-delete.txt
```

**Expected:** Full list of .svelte files

### Step 2: Delete Svelte component files

**Command:**
```bash
find packages/ui/src -name "*.svelte" -type f -not -path "*/node_modules/*" -delete
```

**Expected:** All .svelte files removed

### Step 3: Delete Svelte test files

**Command:**
```bash
find packages/ui/src -path "*/__tests__/*.test.ts" -exec grep -l "import.*svelte" {} \; > /tmp/svelte-tests.txt
cat /tmp/svelte-tests.txt
```

**Expected:** List of Svelte component test files

**Then delete only Svelte-specific tests** (be careful not to delete shared tests):
- Keep: React component tests
- Keep: Store tests (Zustand)
- Delete: Tests importing from .svelte files

### Step 4: Clean up empty directories

**Command:**
```bash
find packages/ui/src/components -type d -empty -delete
find packages/ui/src/stores -type d -empty -delete
```

**Expected:** Empty directories removed

### Step 5: Verify structure

**Command:**
```bash
tree packages/ui/src -L 2 -I node_modules
```

**Expected:** Only React code remains in src/react/

### Step 6: Commit Svelte file removal

**Command:**
```bash
git add -A
git commit -m "chore(ui): remove Svelte component files

- Delete all .svelte component files from src/
- Remove Svelte component tests
- Clean up empty directories
- React version is now the sole implementation
- Part of Phase 4: React migration cleanup"
```

**Expected:** Large commit showing many deletions

---

## Task 3: Update Package Dependencies

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `pnpm-lock.yaml` (auto-updated)

### Step 1: Backup current package.json

**Command:**
```bash
cp packages/ui/package.json packages/ui/package.json.backup
```

**Expected:** Backup created

### Step 2: Remove Svelte dependencies from package.json

**File:** `packages/ui/package.json`

**Remove these dependencies:**
```json
{
  "dependencies": {
    // REMOVE:
    "svelte": "^4.2.8",
    "@melt-ui/svelte": "...",
    "@melt-ui/pp": "..."
  },
  "devDependencies": {
    // REMOVE:
    "@sveltejs/vite-plugin-svelte": "...",
    "svelte-preprocess": "...",
    "svelte-check": "..."
  }
}
```

**Keep these dependencies:**
```json
{
  "dependencies": {
    "@error-mock/core": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.9",
    "lucide-react": "...",
    "@radix-ui/react-*": "..."
  }
}
```

### Step 3: Update package scripts

**File:** `packages/ui/package.json`

**Current scripts:**
```json
{
  "scripts": {
    "build": "rm -rf dist && vite build",
    "dev": "nodemon --watch src ..."
  }
}
```

**Change to (use React build only):**
```json
{
  "scripts": {
    "build": "rm -rf dist && vite build --config vite.react.config.ts",
    "dev": "vite build --config vite.react.config.ts --watch",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 4: Run pnpm install to update lockfile

**Command:**
```bash
pnpm install
```

**Expected:** pnpm-lock.yaml updated, Svelte packages removed

### Step 5: Verify build still works

**Command:**
```bash
pnpm build
```

**Expected:**
```
✓ built in X.XXs
dist/react/index.js  XXX.XX kB │ gzip: XXX.XX kB
```

### Step 6: Commit dependency cleanup

**Command:**
```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore(ui): remove Svelte dependencies from package.json

- Remove svelte, @melt-ui/svelte, svelte-preprocess dependencies
- Update build script to use React config exclusively
- Simplify dev script to use vite watch mode
- Reduces bundle size and dependency tree
- Part of Phase 4: React migration cleanup"
```

**Expected:** Clean commit with package.json and lockfile changes

---

## Task 4: Consolidate Build Configuration

**Files:**
- Delete: `packages/ui/vite.config.ts` (Svelte build)
- Rename: `packages/ui/vite.react.config.ts` → `packages/ui/vite.config.ts`
- Modify: `packages/ui/vitest.config.ts`

### Step 1: Delete Svelte build config

**Command:**
```bash
rm packages/ui/vite.config.ts
```

**Expected:** Svelte build config deleted

### Step 2: Rename React build config to default

**Command:**
```bash
mv packages/ui/vite.react.config.ts packages/ui/vite.config.ts
```

**Expected:** vite.config.ts now uses React build configuration

### Step 3: Update vitest.config.ts to remove Svelte plugin

**File:** `packages/ui/vitest.config.ts`

**Current:**
```typescript
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { preprocessMeltUI } from '@melt-ui/pp';

plugins: [
  svelte({
    hot: !process.env.VITEST,
    preprocess: [sveltePreprocess(), preprocessMeltUI()],
  }),
],
```

**Change to:**
```typescript
// Remove all Svelte-related imports and plugins
export default defineConfig({
  plugins: [],  // No Svelte plugin needed for React tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/*/src/**/*.test.ts'],
    // ... rest stays the same
  },
});
```

### Step 4: Update package.json build script

**File:** `packages/ui/package.json`

**Change:**
```json
{
  "scripts": {
    "build": "rm -rf dist && vite build"
  }
}
```

**Explanation:** Now vite will use default vite.config.ts (React)

### Step 5: Test build with new config

**Command:**
```bash
pnpm build
```

**Expected:** Build succeeds using vite.config.ts

### Step 6: Commit build configuration consolidation

**Command:**
```bash
git add packages/ui/vite.config.ts packages/ui/vitest.config.ts packages/ui/package.json
git commit -m "chore(ui): consolidate build config to React-only

- Delete old vite.config.ts (Svelte)
- Rename vite.react.config.ts to vite.config.ts
- Remove Svelte plugin from vitest.config.ts
- Simplify build script to use default config
- Part of Phase 4: React migration cleanup"
```

**Expected:** Clean commit with renamed and modified files

---

## Task 5: Update Entry Point and Exports

**Files:**
- Modify: `packages/ui/src/index.ts`
- Verify: Export structure matches usage

### Step 1: Review current index.ts

**Command:**
```bash
cat packages/ui/src/index.ts
```

**Expected:** May have both Svelte and React exports

### Step 2: Update to React-only exports

**File:** `packages/ui/src/index.ts`

**Content should be:**
```typescript
// Export React mount function
export { mount } from './react/mount';

// Export React stores
export * from './react/stores';

// Types are still exported from core package
```

### Step 3: Verify package.json exports field

**File:** `packages/ui/package.json`

**Ensure exports field is correct:**
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react/index.js",
      "types": "./dist/react/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  }
}
```

### Step 4: Test build output structure

**Command:**
```bash
pnpm build && ls -la dist/ && ls -la dist/react/
```

**Expected:**
```
dist/
├── index.js
├── index.d.ts
├── style.css
└── react/
    ├── index.js
    └── index.d.ts
```

### Step 5: Commit entry point cleanup

**Command:**
```bash
git add packages/ui/src/index.ts packages/ui/package.json
git commit -m "chore(ui): update exports to React-only

- Update src/index.ts to export React mount and stores only
- Remove Svelte app exports
- Verify package.json exports field correct
- Part of Phase 4: React migration cleanup"
```

**Expected:** Clean commit with export changes

---

## Task 6: Update Plugin Integration

**Files:**
- Verify: `packages/vite-plugin/src/index.ts`
- Verify: `packages/webpack-plugin/src/index.ts`

### Step 1: Check vite-plugin React integration

**Command:**
```bash
grep -A 10 "import.*mount" packages/vite-plugin/src/index.ts
```

**Expected:** Should import from `@error-mock/ui/react`

### Step 2: Check webpack-plugin React integration

**Command:**
```bash
grep -A 10 "import.*mount" packages/webpack-plugin/src/index.ts
```

**Expected:** Should import from `@error-mock/ui/react`

### Step 3: Verify plugins already use React

If both plugins already use `@error-mock/ui/react`, no changes needed.

If they use old Svelte imports, update them:

**Change:**
```typescript
// OLD:
import { App } from '@error-mock/ui';

// NEW:
import { mount } from '@error-mock/ui/react';
```

### Step 4: Build all packages to verify

**Command:**
```bash
pnpm build
```

**Expected:** All packages build successfully

### Step 5: Commit plugin updates (if any)

**Command (only if changes made):**
```bash
git add packages/vite-plugin/src/index.ts packages/webpack-plugin/src/index.ts
git commit -m "chore(plugins): ensure plugins use React mount function

- Verify vite-plugin uses @error-mock/ui/react
- Verify webpack-plugin uses @error-mock/ui/react
- Part of Phase 4: React migration cleanup"
```

**Expected:** Commit only if files changed

---

## Task 7: Clean Up Test Configuration

**Files:**
- Modify: `vitest.config.ts` (root)
- Modify: `packages/ui/vitest.config.ts`

### Step 1: Update root vitest.config.ts

**File:** `vitest.config.ts`

**Remove Svelte plugin:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],  // Remove Svelte plugin
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/*/src/**/*.test.ts'],
    // ... coverage config stays
  },
});
```

### Step 2: Update test include patterns

Only include React tests now:
```typescript
include: [
  'packages/core/src/**/*.test.ts',
  'packages/parser/src/**/*.test.ts',
  'packages/ui/src/react/**/*.test.ts',  // Only React tests
],
```

### Step 3: Run tests to verify

**Command:**
```bash
pnpm test 2>&1 | grep "Test Files"
```

**Expected:** Tests run, only React tests included

### Step 4: Commit test configuration cleanup

**Command:**
```bash
git add vitest.config.ts packages/ui/vitest.config.ts
git commit -m "test: update vitest config to React-only tests

- Remove Svelte plugin from vitest configuration
- Update test include patterns to only match React tests
- Exclude old Svelte component tests
- Part of Phase 4: React migration cleanup"
```

**Expected:** Clean commit with test config changes

---

## Task 8: Documentation Updates

**Files:**
- Modify: `README.md`
- Create: `packages/ui/README.md` (if not exists)
- Modify: `docs/plans/TODO-REMAINING-TASKS.md`

### Step 1: Update main README

**File:** `README.md`

**Update UI framework section:**
```markdown
## UI Framework

Built with:
- **React 18** + Shadow DOM for style isolation
- **shadcn/ui** component library (Radix UI + Tailwind CSS)
- **Zustand** for state management
- **TypeScript 5** for type safety
```

**Remove any Svelte references**

### Step 2: Create or update packages/ui/README.md

**File:** `packages/ui/README.md`

**Content:**
```markdown
# @error-mock/ui

React 18 UI components for Error Mock plugin.

## Tech Stack

- **React 18** - UI framework
- **shadcn/ui** - Component library (Radix UI)
- **Zustand** - State management
- **Tailwind CSS v4** - Styling (OKLCH colors, em: prefix)
- **Shadow DOM** - Style isolation

## Build

\`\`\`bash
pnpm build
\`\`\`

Output:
- `dist/react/index.js` - React app bundle
- `dist/style.css` - Compiled Tailwind styles

## Usage

\`\`\`typescript
import { mount } from '@error-mock/ui/react';

mount({ metas: apiMetas });
\`\`\`

## Components

- `FloatButton` - Draggable trigger button
- `Modal` - Main control panel (Dialog)
- `ApiList` - API selection sidebar
- `RuleEditor` - Rule configuration editor
  - `NetworkTab` - Network simulation settings
  - `ResponseTab` - Response configuration
- `Toast` - Notification system
```

### Step 3: Update TODO-REMAINING-TASKS.md

**File:** `docs/plans/TODO-REMAINING-TASKS.md`

**Add completion notes:**
```markdown
## ✅ Phase 2 完成情况（2025-12-13）

**已完成的任务**：
1. ✅ 移除 Advanced Tab（简化为 2 个 Tabs）
2. ✅ 添加全局 Network Profile 到 Modal Header
3. ✅ API 信息单行布局 + shadcn Switch
4. ✅ Response Tab 完整实现
5. ✅ Network Tab 完整实现

**Phase 4 进行中**: Svelte 代码清理与优化
```

### Step 4: Commit documentation updates

**Command:**
```bash
git add README.md packages/ui/README.md docs/plans/TODO-REMAINING-TASKS.md
git commit -m "docs: update documentation for React-only architecture

- Update main README to reflect React 18 stack
- Create/update packages/ui/README.md with usage guide
- Mark Phase 2 as complete in TODO-REMAINING-TASKS.md
- Remove Svelte references from documentation
- Part of Phase 4: React migration cleanup"
```

**Expected:** Clean commit with documentation updates

---

## Task 9: Optimize Build Output

**Files:**
- Modify: `packages/ui/vite.config.ts`
- Analyze: Bundle size

### Step 1: Check current bundle size

**Command:**
```bash
pnpm build 2>&1 | grep "dist/react/index.js"
```

**Expected:** Shows current size (e.g., "454.27 kB │ gzip: 110.16 kB")

### Step 2: Enable build optimizations in vite.config.ts

**File:** `packages/ui/vite.config.ts`

**Add optimization options:**
```typescript
export default defineConfig({
  build: {
    // ... existing config
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-switch'],
        },
      },
    },
  },
});
```

### Step 3: Rebuild and compare size

**Command:**
```bash
pnpm build 2>&1 | grep "dist/react"
```

**Expected:** Bundle size reduced (or at least not increased)

### Step 4: Verify optimized build works

**Command:**
```bash
pnpm --filter example-vite build
```

**Expected:** Example builds successfully with optimized UI bundle

### Step 5: Commit build optimizations (if improvements made)

**Command:**
```bash
git add packages/ui/vite.config.ts
git commit -m "perf(ui): optimize production bundle

- Enable terser minification
- Remove console.log statements in production
- Add manual chunk splitting for vendors
- Part of Phase 4: React migration cleanup"
```

**Expected:** Commit only if optimizations added

---

## Task 10: Final Verification

### Step 1: Run full build from clean state

**Command:**
```bash
rm -rf node_modules/.vite packages/*/dist
pnpm build
```

**Expected:** All packages build successfully

### Step 2: Verify package structure

**Command:**
```bash
ls -R packages/ui/dist/
```

**Expected:**
```
dist/
├── index.js
├── index.d.ts
├── style.css
└── react/
    ├── index.js
    └── index.d.ts
```

### Step 3: Check final git status

**Command:**
```bash
git status
```

**Expected:**
```
On branch feature/ui-refactor-tab-structure
nothing to commit, working tree clean
```

### Step 4: Review all Phase 4 commits

**Command:**
```bash
git log --oneline --grep="Phase 4" --all-match
```

**Expected:** See all Phase 4 commits

### Step 5: Create Phase 4 completion summary

**Success Criteria:**
- ✅ All Svelte files removed
- ✅ Svelte dependencies removed from package.json
- ✅ Build configuration consolidated
- ✅ Only React version remains
- ✅ Bundle size optimized (or maintained)
- ✅ Documentation updated
- ✅ All builds passing
- ✅ Clean commit history

**Phase 4 Status:** ✅ 100% Complete

---

## Notes

**Backward Compatibility:**
- Users must update their imports to use `@error-mock/ui/react`
- This is a **breaking change** - requires major version bump (v1.0.0)

**What's Removed:**
- Svelte framework and ecosystem
- @melt-ui/svelte component library
- All .svelte component files
- Svelte-specific build configuration

**What's Kept:**
- All core functionality (interceptor, storage, types)
- All React components
- All existing features (Response/Network tabs)
- Backward compatible data storage

**Migration Path for Users:**
```diff
// OLD (Svelte):
- import { App } from '@error-mock/ui';

// NEW (React):
+ import { mount } from '@error-mock/ui/react';
+ mount({ metas: apiMetas });
```
