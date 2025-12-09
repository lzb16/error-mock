# Hot Reload Development Architecture

## Overview

This document describes the hot reload solution for the error-mock-plugin monorepo, balancing **example project purity**, **reliability**, and **tool simplicity**.

---

## Design Goals

1. ✅ **Example project stays pure**: No Svelte plugin installation, minimal configuration
2. ✅ **Consume build artifacts**: Example uses `dist/` to simulate real user scenarios
3. ✅ **Reliable hot reload**: No 404 errors during rebuild
4. ✅ **Simplified toolchain**: Remove nodemon/concurrently/custom watchers
5. ✅ **Production isolation**: Dev tools never affect production builds

---

## Architecture

```
Developer modifies packages/ui/src/*.svelte
    ↓
nodemon detects file change
    ↓
Executes vite build (fresh process, no Rollup cache issue)
    ↓
After build completes → write dist/.build-complete marker
    ↓
errorMockDevWatcher detects marker change
    ↓
500ms delay + file existence check
    ↓
Confirm files complete → trigger browser reload ✅
```

### Why nodemon instead of `vite build --watch`?

**Problem with `vite build --watch` in library mode**:
- ✅ First change: Detects and rebuilds successfully
- ❌ Second change: Logs show "built in ~300ms" but **dist files are NOT updated**
- Root cause: Rollup cache invalidation bug in Vite library mode ([#16104](https://github.com/vitejs/vite/issues/16104), [#10256](https://github.com/vitejs/vite/issues/10256))

**nodemon solution**:
- Each file change triggers a **fresh vite build process**
- No Rollup cache carried over between builds
- Reliable file updates every time
- Community-proven approach for monorepo + Svelte ([StackOverflow example](https://stackoverflow.com/questions/78528430))

---

## Components

### 1. UI Package Build Marker

**File**: `packages/ui/vite.config.ts`

```typescript
import { writeFileSync } from 'fs';

export default defineConfig({
  plugins: [
    // ... other plugins
    {
      name: 'build-complete-marker',
      writeBundle() {
        const markerPath = resolve(__dirname, 'dist/.build-complete');
        writeFileSync(markerPath, Date.now().toString());
      },
    },
  ],
  build: {
    emptyOutDir: false, // Avoid delete-recreate window in watch mode
    watch: {
      include: ['src/**'],
      chokidar: {
        usePolling: true, // Better compatibility on some filesystems
        interval: 300,
      },
    },
  },
});
```

**Scripts** (`packages/ui/package.json`):
```json
{
  "scripts": {
    "build": "rm -rf dist && vite build",  // Production: clean first
    "dev": "vite build --watch --clearScreen=false"  // Development: incremental
  }
}
```

---

### 2. Dev Watcher Helper

**File**: `packages/vite-plugin/src/index.ts`

```typescript
export function errorMockDevWatcher(options: ErrorMockDevWatcherOptions): Plugin {
  const { watch: watchPackages, packagesDir = '../../packages', reloadDelay = 500 } = options;

  return {
    name: 'error-mock-dev-watcher',
    apply: 'serve', // Only in dev mode

    configureServer(server: ViteDevServer) {
      // Map marker paths to package names
      const markerMap = new Map<string, string>();
      const timers: NodeJS.Timeout[] = [];

      watchPackages.forEach((pkg) => {
        const markerPath = path.normalize(
          path.resolve(server.config.root, packagesDir, pkg, 'dist', '.build-complete')
        );
        markerMap.set(markerPath, pkg);
        server.watcher.add(markerPath);
      });

      // Single change handler (avoids duplicate checks)
      server.watcher.on('change', (changedPath) => {
        const pkg = markerMap.get(path.normalize(changedPath));
        if (pkg) {
          // Delay + existence check + reload
        }
      });

      // Cleanup on server close
      server.httpServer?.on('close', () => {
        timers.forEach(timer => clearTimeout(timer));
      });
    },
  };
}
```

**Key Features**:
- Single event handler (avoids N duplicate checks)
- Debounce with file existence check
- Timer cleanup on server shutdown
- Cross-platform path handling
- Optional CSS file (only `index.js` required)

---

### 3. Example Project Usage

**File**: `examples/vite-example/vite.config.ts` (32 lines)

```typescript
import errorMockPlugin, { errorMockDevWatcher } from '../../packages/vite-plugin/src/index.ts';

export default defineConfig({
  plugins: [
    errorMockPlugin({ apiDir: 'src/api' }),
    errorMockDevWatcher({ watch: ['ui'] }), // ← Only 1 line!
  ],
  resolve: {
    alias: {
      '@error-mock/ui': resolve(packagesDir, 'ui/dist'),
      '@error-mock/core': resolve(packagesDir, 'core/dist'),
    },
  },
  server: {
    fs: { allow: ['../..'] },
  },
});
```

---

## Development Workflow

### Start Development

```bash
# Single command
pnpm dev

# Equivalent to:
pnpm --parallel --filter @error-mock/ui --filter vite-example dev
```

**What happens**:
1. `packages/ui`: Runs `vite build --watch`
2. `examples/vite-example`: Runs `vite` dev server
3. Both processes run in parallel

### Hot Reload Flow

```
1. Edit packages/ui/src/App.svelte
2. vite build detects change → rebuilds (~2s)
3. Writes dist/.build-complete marker
4. errorMockDevWatcher detects marker
5. 500ms delay + checks index.js exists
6. Triggers browser reload ✅
```

---

## Production Build

```bash
pnpm build
```

**Ensures clean output**:
- UI package: `rm -rf dist && vite build` (removes old files)
- No development artifacts in published package
- `emptyOutDir: false` only affects watch mode

---

## Trade-offs & Rationale

### Why Not Source Code Direct Linking?

**Alternative approach**:
```typescript
// Example could alias to source
resolve: {
  alias: {
    '@error-mock/ui': '../../packages/ui/src'
  }
}
```

**Pros**: Vite HMR (milliseconds), zero build delay
**Cons**: Example must install Svelte plugin, scan Tailwind in parent dirs

**Decision**: Consume `dist/` to keep example pure (matches real user scenario)

---

### Why Build Completion Marker?

**Problem**: Filesystem events fire when write *starts*, not when it *completes*

**Alternatives tried**:
1. ❌ Atomic rename: Breaks Rollup references
2. ❌ `@prosopo/vite-plugin-watch-workspace`: Designed for direct source compilation
3. ❌ Fixed delay: Unreliable (build time varies)

**Solution**: Marker file written in `writeBundle` hook (guaranteed after all files complete)

---

## Comparison with Previous Approaches

| Version | Tools | Example Config | Issues |
|---------|-------|----------------|--------|
| **v1** | `vite build --watch` | Simple | Only detects first change |
| **v2** | + Custom watch plugin | +30 lines | Detects all changes but 404 errors |
| **v3** | + nodemon | +40 lines | Reliable but complex |
| **v4 (Current)** | vite watch + marker + helper | **+1 line** ✅ | Reliable + simple |

---

## Multi-Package Support

To watch additional packages:

```typescript
errorMockDevWatcher({
  watch: ['ui', 'core', 'parser']
})
```

The watcher automatically:
- Monitors each package's `.build-complete` marker
- Uses a single event handler (efficient)
- Triggers reload when any package rebuilds

---

## Debugging

### Enable Logs

Logs are enabled by default:

```
[dev-watcher] 监听包: ui
[dev-watcher] ui 包构建完成
[dev-watcher] ui 关键文件存在(含CSS)，触发刷新
```

### Troubleshooting

**Issue**: Marker file not detected
**Fix**: Check `packagesDir` option matches your project structure

**Issue**: Still getting 404
**Fix**: Increase `reloadDelay` option (default 500ms)

**Issue**: Build seems stuck
**Fix**: Check UI package `vite build --watch` is running

---

## Future Improvements

1. **Configurable required files**: Allow specifying which files must exist before reload
2. **Vite native support**: Track RFC for `resolve.localSources` feature
3. **Build caching**: Investigate faster incremental builds

---

## Implementation Notes

### Safety Guarantees

1. **Development-only**: `apply: 'serve'` ensures no production impact
2. **Explicit opt-in**: Example must explicitly add `errorMockDevWatcher()`
3. **Timer cleanup**: All timeouts cleared on server shutdown
4. **Type safety**: Full TypeScript support with exported interfaces

### Cross-Platform Compatibility

- ✅ Uses `path.normalize()` for consistent path comparison
- ✅ `fs.renameSync()` platform differences avoided (using marker instead)
- ✅ `usePolling: true` for filesystems that need it

---

## Summary

**Final architecture achieves**:
- 🎯 Example project: 32 lines (vs 65 before)
- 🎯 Core config: 1 line (`errorMockDevWatcher({ watch: ['ui'] })`)
- 🎯 Tools removed: nodemon, concurrently, 40-line custom plugin
- 🎯 Reliability: Zero 404 errors during hot reload
- 🎯 Production safe: Complete isolation from user builds
