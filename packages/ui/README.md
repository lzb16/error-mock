# @error-mock/ui

React 18 UI components for Error Mock plugin.

## Tech Stack

- **React 18** - UI framework
- **shadcn/ui** - Component library (Radix UI primitives)
- **Zustand** - State management
- **Tailwind CSS v4** - Styling with OKLCH colors and em: prefix
- **Shadow DOM** - Style isolation from host page
- **TypeScript 5** - Type safety

## Build

```bash
pnpm build
```

Output:
- `dist/react/index.js` - React app bundle
- `dist/style.css` - Compiled Tailwind styles

## Usage

The UI is mounted programmatically via the `mount` function:

```typescript
import { mount } from '@error-mock/ui/react';

// Mount the UI with API metadata
mount({ metas: apiMetas, locale: 'zh' }); // default: 'zh'
```

You can also switch language at runtime:

```typescript
import { setLocale } from '@error-mock/ui/react';

setLocale('en');
```

The mount function:
1. Creates a Shadow DOM container
2. Injects compiled styles
3. Renders the React app inside Shadow DOM
4. Returns cleanup function

## Components

### Layout Components

- **FloatButton** - Draggable trigger button (bottom-right corner)
- **Modal** - Main control panel dialog
- **ApiList** - API selection sidebar with search and filtering

### Rule Editor Components

- **RuleEditor** - Container for rule configuration
- **NetworkTab** - Network simulation settings (delay, failure rate, timeout, offline)
- **ResponseTab** - Response configuration (business error, success data)
- **RuleControlBar** - Tab navigation and mock type controls

### Shared Components

- **Toast** - Notification system for user feedback

## State Management

Zustand stores:

- **useRulesStore** - API rules and mock configuration
- **useModalStore** - Modal visibility and UI state

## Style System

- **Prefix**: All classes use `em-` prefix to avoid conflicts
- **Colors**: OKLCH color space for better perceptual uniformity
- **Theme**: GitHub-inspired design system
- **Isolation**: Shadow DOM prevents style leakage

## Development

```bash
# Watch mode for live development
pnpm dev

# Type checking
pnpm type-check
```

## Testing

Tests are located in `__tests__/` directories alongside components.

```bash
# Run tests
pnpm test

# Coverage report
pnpm test:coverage
```

Target coverage: ≥90%
