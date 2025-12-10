# UI Component Library

Wrapper components around **Melt UI** (Svelte 4 headless library) with **GitHub Primer** styling.

## Architecture Decision

**Why Wrapper Layer?**

We don't use Melt UI directly in business logic. Instead, we wrap primitives in this directory. Benefits:

1. **Future Migration**: When we upgrade to Svelte 5, we can switch to Bits UI by only modifying these wrapper files
2. **Consistent API**: Business components use a stable interface regardless of underlying library
3. **Design System**: All GitHub Primer styling lives here, not scattered across codebase
4. **DRY**: Reusable components reduce duplication

**Gemini's Guidance:**
> "If you need to migrate to Bits UI (Svelte 5) later, you only modify the wrapper files, not business logic."

## Available Components

### Tabs
Tab navigation with keyboard support and ARIA attributes.

```svelte
<script>
  import { Tabs } from '../../ui';

  const tabs = [
    { value: 'network', label: 'Network' },
    { value: 'response', label: 'Response' },
  ];
</script>

<Tabs {tabs} value="network" onChange={(v) => console.log(v)} />
```

**Props:**
- `tabs: Tab[]` - Array of `{ value, label, disabled? }`
- `value: string` - Currently active tab
- `onChange: (value: string) => void` - Callback on tab change
- `orientation: 'horizontal' | 'vertical'` - Layout direction (default: horizontal)

**Features:**
- ✅ Keyboard navigation (Arrow keys, Home/End)
- ✅ ARIA attributes (`role="tab"`, `aria-selected`)
- ✅ GitHub Primer styling
- ✅ Focus ring (`#0969DA`)

### Switch
Toggle switch (checkbox) with GitHub styling.

```svelte
<script>
  import { Switch } from '../../ui';
</script>

<Switch label="Enable" checked={true} onChange={(v) => console.log(v)} />
```

**Props:**
- `label: string` - Label text
- `checked: boolean` - Switch state
- `onChange: (checked: boolean) => void` - Callback on state change
- `disabled: boolean` - Disabled state
- `size: 'sm' | 'md'` - Size variant (default: md)

**Features:**
- ✅ GitHub green (`#1F883D`) when enabled
- ✅ Gray (`#D0D7DE`) when disabled
- ✅ ARIA attributes (`aria-checked`)
- ✅ Focus ring

## Design System

All components follow **GitHub Primer** design tokens:

### Colors
- Primary: `#0969DA` (blue-600)
- Success: `#1F883D` (green-600)
- Border: `#D0D7DE` (slate-300)
- Text Primary: `#1F2328` (slate-900)
- Text Secondary: `#656D76` (slate-500)

### Spacing
- Padding: `px-3 py-1.5` (tabs), `p-2` (small), `p-4` (cards)
- Gap: `gap-1` (tabs), `gap-2` (inline), `gap-4` (sections)

### Typography
- Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
- Size: `text-xs` (12px), `text-sm` (14px), `text-base` (16px)
- Weight: `font-medium` (500), `font-semibold` (600), `font-bold` (700)

See `docs/prototypes/01-design-system.md` for complete specification.

## Adding New Components

When adding a new UI wrapper:

1. **Create component**: `packages/ui/src/components/ui/MyComponent.svelte`
2. **Write tests first**: `packages/ui/src/components/ui/__tests__/MyComponent.test.ts`
3. **Wrap Melt UI primitive**: Use `createX` from `@melt-ui/svelte`
4. **Apply GitHub Primer styles**: Use Tailwind classes with `em-` prefix
5. **Export**: Add to `packages/ui/src/components/ui/index.ts`
6. **Test coverage**: Achieve ≥90% branch coverage

### Example Template

```svelte
<script lang="ts">
  import { createX, melt } from '@melt-ui/svelte';

  export let someProp: string;
  export let onChange: ((value: string) => void) | undefined = undefined;

  const { elements, states } = createX({
    defaultValue: someProp,
    onValueChange: ({ next }) => {
      if (onChange) onChange(next);
      return next;
    }
  });
</script>

<div use:melt={$elements.root} class="em-...">
  <!-- Component structure -->
</div>
```

## Testing Requirements

Every component must have:
- ✅ Rendering tests
- ✅ Interaction tests (click, keyboard)
- ✅ ARIA attribute tests
- ✅ Styling tests (active states, focus)
- ✅ Callback tests (onChange, etc.)

**Minimum coverage:** 90%

## Future Migration Path

When upgrading to **Svelte 5** and **Bits UI**:

1. Update `package.json`: Replace `@melt-ui/svelte` with `bits-ui`
2. Update each wrapper: Replace `createX` from Melt with Bits equivalent
3. Run tests: `pnpm test` - all should pass (same API)
4. Business logic: **No changes needed** (this is the goal!)

**Estimated migration time:** 2-4 hours (vs. 2-3 days if no wrapper layer)

---

**Created:** 2025-12-11
**Maintainer:** UI Team
**Status:** Stable
