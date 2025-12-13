# Remove Advanced Tab and Add Global Network Profile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify RuleEditor to 2 tabs (Response + Network) and add global network profile control to Modal Header.

**Architecture:** Remove Advanced Tab and Field Omit UI from RuleEditor while keeping backward compatibility in data model. Add network profile dropdown to Modal Header for global delay configuration.

**Tech Stack:** React 18, TypeScript, shadcn/ui, Zustand, Tailwind CSS

---

## Task 1: Remove Advanced Tab from RuleEditor

**Files:**
- Delete: `packages/ui/src/react/components/RuleEditor/AdvancedTab.tsx`
- Modify: `packages/ui/src/react/components/RuleEditor.tsx:1-170`

### Step 1: Delete AdvancedTab component file

**Action:**
```bash
rm packages/ui/src/react/components/RuleEditor/AdvancedTab.tsx
```

**Expected:** File deleted successfully

### Step 2: Remove AdvancedTab import from RuleEditor

**File:** `packages/ui/src/react/components/RuleEditor.tsx`

**Change:**
```typescript
// REMOVE this import (line 9):
import { AdvancedTab } from './RuleEditor/AdvancedTab';
```

**Result:** Only NetworkTab and ResponseTab imports remain

### Step 3: Remove Advanced tab trigger from TabsList

**File:** `packages/ui/src/react/components/RuleEditor.tsx`

**Current code (lines 138-142):**
```typescript
<TabsList>
  <TabsTrigger value="network">Network</TabsTrigger>
  <TabsTrigger value="response">Response</TabsTrigger>
  <TabsTrigger value="advanced">Advanced</TabsTrigger>
</TabsList>
```

**Change to:**
```typescript
<TabsList>
  <TabsTrigger value="network">Network</TabsTrigger>
  <TabsTrigger value="response">Response</TabsTrigger>
</TabsList>
```

### Step 4: Remove Advanced TabsContent from render

**File:** `packages/ui/src/react/components/RuleEditor.tsx`

**Remove these lines (154-156):**
```typescript
<TabsContent value="advanced" className="em:mt-0">
  <AdvancedTab rule={rule} onChange={handleFieldChange} />
</TabsContent>
```

**Result:** Only network and response TabsContent remain

### Step 5: Verify build compiles

**Command:**
```bash
cd packages/ui && pnpm build
```

**Expected output:**
```
✓ built in X.XXs
dist/react/index.js  XXX.XX kB │ gzip: XXX.XX kB
```

**Expected:** No TypeScript errors, no import errors

### Step 6: Commit Advanced Tab removal

**Command:**
```bash
git add -A
git commit -m "refactor(ui): remove Advanced tab, simplify to Response + Network only

- Delete AdvancedTab.tsx component
- Remove Advanced tab trigger and content from RuleEditor
- Keep fieldOmit in data model for backward compatibility
- Reduces UI complexity per design spec"
```

**Expected:** Clean commit with deleted and modified files

---

## Task 2: Add Global Network Profile to Modal Header

**Files:**
- Modify: `packages/ui/src/react/components/Modal.tsx:1-74`
- Create: `packages/ui/src/react/components/modal/NetworkProfileSelect.tsx`

### Step 1: Create NetworkProfileSelect component

**File:** `packages/ui/src/react/components/modal/NetworkProfileSelect.tsx`

**Content:**
```typescript
import { Globe } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import type { NetworkProfile } from '@error-mock/core';

export function NetworkProfileSelect() {
  const { globalConfig, updateGlobalConfig } = useConfigStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateGlobalConfig({ networkProfile: e.target.value as NetworkProfile });
  };

  return (
    <div className="em:flex em:items-center em:gap-2">
      <Globe className="em:w-4 em:h-4 em:text-gray-500" aria-hidden="true" />
      <select
        value={globalConfig.networkProfile}
        onChange={handleChange}
        className="em:px-3 em:py-1.5 em:text-sm em:border em:border-gray-300 em:rounded-md em:bg-white focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
        aria-label="Global Network Profile"
      >
        <option value="none">No Delay</option>
        <option value="fast4g">Fast 4G (150ms)</option>
        <option value="slow3g">Slow 3G (500ms)</option>
        <option value="2g">2G (1500ms)</option>
      </select>
    </div>
  );
}
```

### Step 2: Create modal directory if not exists

**Command:**
```bash
mkdir -p packages/ui/src/react/components/modal
```

**Expected:** Directory created or already exists

### Step 3: Write the NetworkProfileSelect component

**Action:** Create the file with content from Step 1

**Verify:**
```bash
ls -la packages/ui/src/react/components/modal/NetworkProfileSelect.tsx
```

**Expected:** File exists with ~30 lines

### Step 4: Update Modal.tsx to import NetworkProfileSelect

**File:** `packages/ui/src/react/components/Modal.tsx`

**Add import (after line 11):**
```typescript
import { NetworkProfileSelect } from './modal/NetworkProfileSelect';
```

### Step 5: Modify DialogHeader to include NetworkProfileSelect

**File:** `packages/ui/src/react/components/Modal.tsx`

**Current code (lines 45-56):**
```typescript
<DialogHeader
  showCloseButton
  className="em:px-6 em:py-4 em:border-b em:border-gray-200 em:bg-gradient-to-r em:from-blue-50 em:to-indigo-50 em:space-y-0"
>
  <div className="em:flex em:items-center em:gap-2">
    <WandSparkles className="em:w-6 em:h-6 em:text-blue-600" />
    <DialogTitle className="em:text-xl em:font-bold em:text-gray-800">
      Error Mock Control Panel
    </DialogTitle>
  </div>
</DialogHeader>
```

**Change to:**
```typescript
<DialogHeader
  showCloseButton
  className="em:px-6 em:py-4 em:border-b em:border-gray-200 em:bg-gradient-to-r em:from-blue-50 em:to-indigo-50 em:space-y-0"
>
  <div className="em:flex em:items-center em:justify-between em:gap-4">
    <div className="em:flex em:items-center em:gap-2">
      <WandSparkles className="em:w-6 em:h-6 em:text-blue-600" />
      <DialogTitle className="em:text-xl em:font-bold em:text-gray-800">
        Error Mock Control Panel
      </DialogTitle>
    </div>
    <NetworkProfileSelect />
  </div>
</DialogHeader>
```

**Key changes:**
- Add `em:justify-between` to flex container
- Wrap title + icon in inner div
- Add `<NetworkProfileSelect />` component

### Step 6: Verify TypeScript compiles

**Command:**
```bash
cd packages/ui && pnpm build
```

**Expected output:**
```
✓ built in X.XXs
dist/react/index.js  XXX.XX kB │ gzip: XXX.XX kB
```

**Expected:** No TypeScript errors, successful build

### Step 7: Manual test in browser

**Steps:**
1. Start dev server: `pnpm --filter example-vite dev`
2. Open browser: http://localhost:5173
3. Click float button to open modal
4. Verify Network Profile dropdown appears in header (top-right)
5. Select different profiles (Fast 4G, Slow 3G, etc.)
6. Close modal and reopen - verify selection persists
7. Open Network tab in RuleEditor
8. Verify "Follow Global" shows current profile value

**Expected:** All interactions work, no console errors

### Step 8: Commit global network profile feature

**Command:**
```bash
git add packages/ui/src/react/components/Modal.tsx packages/ui/src/react/components/modal/NetworkProfileSelect.tsx
git commit -m "feat(ui): add global network profile control to modal header

- Create NetworkProfileSelect component with Globe icon
- Add to Modal header between title and close button
- Integrates with useConfigStore for persistence
- Displays current profile with delays (Fast 4G, Slow 3G, 2G)
- Updates automatically in NetworkTab 'Follow Global' option"
```

**Expected:** Clean commit with 2 files (1 new, 1 modified)

---

## Task 3: Final Verification

### Step 1: Run full build

**Command:**
```bash
pnpm build
```

**Expected:** All packages build successfully

### Step 2: Check git status

**Command:**
```bash
git status
```

**Expected output:**
```
On branch feature/ui-refactor-tab-structure
nothing to commit, working tree clean
```

### Step 3: Review commit history

**Command:**
```bash
git log --oneline -3
```

**Expected:** See 2 new commits:
1. "feat(ui): add global network profile control to modal header"
2. "refactor(ui): remove Advanced tab, simplify to Response + Network only"

### Step 4: Document completion

**Success Criteria:**
- ✅ Advanced Tab removed from UI
- ✅ RuleEditor shows only 2 tabs (Response, Network)
- ✅ Global Network Profile dropdown in Modal header
- ✅ Profile selection persists in localStorage
- ✅ NetworkTab "Follow Global" reflects current profile
- ✅ All TypeScript compiles without errors
- ✅ 2 clean commits with descriptive messages

**Phase 2 Status:** ✅ 100% Complete

---

## Notes

**Backward Compatibility:**
- `fieldOmit` remains in MockRule type definition
- Existing rules with fieldOmit data will not break
- UI simply doesn't display/edit fieldOmit anymore
- Future: Can be exposed in Settings if needed

**Testing Considerations:**
- Manual testing recommended for this UI change
- No unit tests modified (UI components not currently tested)
- Integration test: Verify modal opens and profile changes

**Design Alignment:**
- Matches `RuleEditor-Redesign-Final.md` specification
- 2 tabs as designed (Response + Network)
- Global profile in header as specified
- Clean, simplified UI
