# Svelte Removal Audit Report

**Date:** 2025-12-13
**Location:** `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui`
**Task:** Phase 4 - Cleanup and Optimization (Task 1)

---

## Executive Summary

This audit identifies all Svelte-related code, dependencies, and configurations that need to be removed from the UI package after the React migration is complete.

**Total Svelte Files Found:** 19 .svelte files
**Svelte Dependencies:** 5 packages (3 runtime + 2 dev)
**Build Configs:** 1 Svelte-specific config file
**Test Files:** 17 test files (10 testing Svelte components)

---

## 1. Svelte Component Files (19 files)

### Core Components (4 files)
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/App.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/Modal.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/Toast.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/FloatButton.svelte`

### Business Components (5 files)
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/BatchPanel.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/ApiList.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/RuleEditor.old.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/modal/Header.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/modal/Footer.svelte`

### Rule Editor Components (5 files)
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/rule-editor/RuleEditor.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/rule-editor/controls/BatchControlBar.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/rule-editor/tabs/AdvancedTab.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/rule-editor/tabs/NetworkTab.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/rule-editor/tabs/ResponseTab.svelte`

### Shared/UI Components (3 files)
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/shared/MixedCheckbox.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/shared/MixedTextInput.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/ui/Switch.svelte`
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/components/ui/Tabs.svelte`

---

## 2. Dependencies to Remove

### Runtime Dependencies (from `dependencies`)
```json
"@melt-ui/svelte": "^0.86.6",    // Svelte UI library
"svelte": "^4.2.8",               // Svelte framework
```

### Dev Dependencies (from `devDependencies`)
```json
"@melt-ui/pp": "^0.3.2",                     // Melt-UI preprocessor
"@sveltejs/vite-plugin-svelte": "^3.0.1",   // Vite plugin for Svelte
"@tsconfig/svelte": "^5.0.2",               // TypeScript config for Svelte
"svelte-preprocess": "^6.0.3",              // Svelte preprocessor
```

**Total Svelte Dependencies:** 5 packages

---

## 3. Build Configuration Files

### Files to Remove
1. `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/vite.config.ts`
   - **Purpose:** Svelte-specific Vite build configuration
   - **Key plugins:** `@sveltejs/vite-plugin-svelte`, `svelte-preprocess`, `preprocessMeltUI`
   - **Entry point:** `src/index.ts` (exports Svelte components)

### Files to Keep (React build config)
1. `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/vite.react.config.ts`
   - **Purpose:** React build configuration (production-ready)
   - **Entry point:** `src/react/index.ts`
   - **Output:** `dist/react/`

---

## 4. Configuration Files to Update

### 4.1 `package.json`

#### Scripts to Remove/Update
```json
"build:svelte": "vite build --config vite.config.ts",  // REMOVE
"dev": "nodemon --watch src --watch tailwind.config.* --watch postcss.config.* --watch tsconfig.* --ext svelte,ts,js,css --exec \"vite build\"",  // REMOVE or UPDATE
```

#### Scripts to Keep/Update
```json
"build": "rm -rf dist && vite build --config vite.react.config.ts",  // KEEP (already React)
"dev:react": "nodemon --watch src/react --watch tailwind.config.* --ext ts,tsx,css --exec \"vite build --config vite.react.config.ts\"",  // KEEP
```

**Recommendation:** Rename `dev:react` to `dev` and remove `dev` after Svelte removal.

### 4.2 `tsconfig.json`

#### Lines to Update
```json
"extends": "@tsconfig/svelte/tsconfig.json",  // Line 2 - REMOVE this extends
```

**Recommendation:** Either remove the `extends` or use a standard TypeScript config (e.g., `@tsconfig/node18`).

### 4.3 `tailwind.config.js`

#### Line to Update
```javascript
content: [
  './src/**/*.{svelte,js,ts,tsx}',  // Line 5 - REMOVE 'svelte' from glob pattern
],
```

**Updated version:**
```javascript
content: [
  './src/**/*.{js,ts,tsx}',  // Only React file extensions
],
```

---

## 5. Entry Point Files

### File to Remove/Update
- `/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui/src/index.ts`
  - **Current:** Exports `App.svelte` and stores
  - **Action:** Remove this file (Svelte entry point)
  - **Replacement:** `src/react/index.ts` is already the React entry point

---

## 6. Test Files to Remove

### Svelte Component Tests (10 files)
All tests import and test Svelte components - should be removed:

1. `src/components/modal/__tests__/Header.test.ts`
2. `src/components/modal/__tests__/Footer.test.ts`
3. `src/components/__tests__/FloatButton.test.ts`
4. `src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts`
5. `src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts`
6. `src/components/rule-editor/__tests__/RuleEditor.test.ts`
7. `src/components/rule-editor/tabs/__tests__/AdvancedTab.test.ts`
8. `src/components/rule-editor/tabs/__tests__/ResponseTab.test.ts`
9. `src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts`
10. `src/components/ui/__tests__/Tabs.test.ts`

### Tests to Keep
The React store tests in `src/react/stores/__tests__/` should be kept:
- `stores.test.ts`
- `configMigration.test.ts`
- `appliedRules.test.ts`

---

## 7. Complete Removal Checklist

### Phase 1: Source Files
- [ ] Remove all 19 `.svelte` component files
- [ ] Remove 10 Svelte test files
- [ ] Remove `src/index.ts` (Svelte entry point)
- [ ] Remove `src/components/` directory (if only contains Svelte files)
- [ ] Remove `src/stores/` directory (if Svelte-specific, keep if used by React)

### Phase 2: Build Configuration
- [ ] Remove `vite.config.ts` (Svelte build config)
- [ ] Update `package.json`:
  - [ ] Remove `build:svelte` script
  - [ ] Remove/update `dev` script
  - [ ] Optionally rename `dev:react` to `dev`
- [ ] Update `tsconfig.json`:
  - [ ] Remove `extends: "@tsconfig/svelte/tsconfig.json"`
  - [ ] Add appropriate base config (e.g., standard Node/React config)
- [ ] Update `tailwind.config.js`:
  - [ ] Remove `svelte` from content glob pattern
  - [ ] Change to `./src/**/*.{js,ts,tsx}`

### Phase 3: Dependencies
- [ ] Remove `@melt-ui/svelte` from dependencies
- [ ] Remove `svelte` from dependencies
- [ ] Remove `@melt-ui/pp` from devDependencies
- [ ] Remove `@sveltejs/vite-plugin-svelte` from devDependencies
- [ ] Remove `@tsconfig/svelte` from devDependencies
- [ ] Remove `svelte-preprocess` from devDependencies
- [ ] Run `pnpm install` to clean up lock file

### Phase 4: Package.json Exports (Verify)
- [ ] Verify `package.json` exports section points to React build only:
  ```json
  "exports": {
    ".": {
      "import": "./dist/react/index.js",
      "types": "./dist/react/index.d.ts"
    }
  }
  ```
- [ ] Verify `main` and `module` fields point to React build

### Phase 5: Verification
- [ ] Run `pnpm build` to ensure React build still works
- [ ] Run `pnpm test` (if tests exist) to verify no broken imports
- [ ] Check `dist/` output to ensure only React artifacts
- [ ] Verify no `import ... from '*.svelte'` remains in codebase
- [ ] Search for any remaining "svelte" references: `grep -ri "svelte" .`

### Phase 6: Documentation
- [ ] Update README.md to remove Svelte references (if any)
- [ ] Update any architecture docs to reflect React-only approach
- [ ] Note the migration in CHANGELOG.md

---

## 8. Edge Cases and Surprises

### 8.1 Shared Stores
**Location:** `src/stores/`

The stores (`config.ts`, `rules.ts`) were originally written for Svelte but have been adapted for React (using Zustand). These are currently imported by the React components.

**Recommendation:** Keep these stores but verify they're only used by React code. If they contain Svelte-specific code (e.g., Svelte stores API), they should be refactored or the React versions should be kept exclusively.

### 8.2 Old Editor File
**File:** `RuleEditor.old.svelte`

This appears to be a backup/legacy file. Safe to remove.

### 8.3 Build Output Directories
The current setup uses:
- `dist/` for Svelte build output
- `dist/react/` for React build output

After Svelte removal, consider simplifying to just `dist/` for React output.

### 8.4 CSS/Styles
**Location:** `src/styles/main.css`

Verify that this CSS is being imported by the React entry point (`src/react/index.ts`) and not just the Svelte entry point.

**Current Status:**
- Svelte entry: `src/index.ts` imports `./styles/main.css`
- React entry: Need to verify

### 8.5 Package Exports Conflict
The `package.json` currently has:
```json
"main": "./dist/index.js",
"module": "./dist/index.js",
```

But the `exports` field points to `./dist/react/index.js`.

**Issue:** This creates ambiguity. After Svelte removal, align all entry points.

---

## 9. Post-Removal Verification Commands

```bash
# Search for any remaining Svelte references
grep -ri "svelte" . --exclude-dir=node_modules --exclude-dir=dist

# Search for .svelte imports
grep -r "\.svelte" src/ --include="*.ts" --include="*.tsx"

# Verify build works
pnpm build

# Check output directory
ls -la dist/

# Verify package exports
node -e "console.log(require('./package.json').exports)"
```

---

## 10. Risk Assessment

### Low Risk
- Removing `.svelte` files (completely replaced by React)
- Removing Svelte dependencies
- Removing `vite.config.ts`

### Medium Risk
- Updating `tsconfig.json` (may affect build)
- Updating package.json scripts (may affect developer workflow)
- Removing `src/index.ts` (verify nothing imports it)

### High Risk (Requires Verification)
- Stores migration status (verify React stores work independently)
- CSS imports (verify styles are loaded in React build)
- Package exports alignment (ensure consumers can import correctly)

---

## 11. Estimated Impact

**Files to Delete:** 30+ files (19 components + 10 tests + 1 config)
**Lines to Change:** ~15 lines across 3 config files
**Dependencies to Remove:** 5 packages
**Build Pipeline Changes:** Simplify to single React build

**Estimated Time:** 1-2 hours (including verification)

---

## 12. Next Steps (Task 2 Preparation)

After this audit is reviewed and approved:

1. **Task 2:** Execute the removal according to this checklist
2. **Task 3:** Run comprehensive verification
3. **Task 4:** Update documentation

**Recommendation:** Execute removal in phases (source files → configs → dependencies) to catch issues early.

---

**Audit Completed:** ✅
**Ready for Review:** Yes
**Blockers:** None identified
