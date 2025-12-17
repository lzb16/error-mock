import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { createDefaultAdapter, type ApiAdapter, type ApiMeta } from '@error-mock/parser';
import path from 'path';
import fs from 'fs';

export interface ErrorMockVitePluginOptions {
  /**
   * API directory path (relative to project root)
   * @default 'src/api'
   */
  apiDir?: string;

  /**
   * Custom API adapter for parsing
   */
  adapter?: ApiAdapter;

  /**
   * Request matching options.
   *
   * Useful for dev proxy setups (e.g. Umi) where requests are prefixed with
   * something like `/api`, but your API definitions/rules are stored without it.
   */
  match?: {
    /**
     * Strip these prefixes from request URL pathname before matching rules.
     * @example ['/api']
     */
    stripPrefixes?: string[];
  };
}

/**
 * Vite plugin for Error Mock
 * Injects error mock UI and runtime into development builds
 */
export function errorMockVitePlugin(options: ErrorMockVitePluginOptions = {}): Plugin {
  const opts: Required<ErrorMockVitePluginOptions> = {
    apiDir: options.apiDir || 'src/api',
    adapter: options.adapter || createDefaultAdapter(),
    match: options.match || {},
  };

  let config: ResolvedConfig;
  let apiMetas: ApiMeta[] = [];

  const VIRTUAL_MODULE_ID = 'virtual:error-mock-runtime';
  const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

  return {
    name: 'error-mock-plugin',

    // Only apply in serve mode (development)
    apply: 'serve',

    configResolved(resolvedConfig) {
      config = resolvedConfig;

      // Resolve API directory path
      const fullPath = path.resolve(config.root, opts.apiDir);

      // Parse API directory
      try {
        apiMetas = opts.adapter.parse(fullPath);
        console.log(`[ErrorMock][build] Parsed ${apiMetas.length} APIs from ${fullPath}`);
      } catch (error) {
        console.warn(`[ErrorMock] Failed to parse API directory: ${fullPath}`, error);
        apiMetas = [];
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return generateRuntimeCode(apiMetas, opts.match);
      }
    },

    transformIndexHtml() {
      // Inject runtime script only
      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: '/@id/__x00__virtual:error-mock-runtime' },
          injectTo: 'body',
        },
      ];
    },
  };
}

function generateRuntimeCode(
  apiMetas: ApiMeta[],
  matchOptions: NonNullable<ErrorMockVitePluginOptions['match']>
): string {
  return `
// Error Mock Runtime - Auto-injected by vite plugin
import { mount, isMounted } from '@error-mock/plugin/runtime';

// API metadata from build time
const apiMetas = ${JSON.stringify(apiMetas, null, 2)};
const runtimeConfig = ${JSON.stringify({ match: matchOptions }, null, 2)};

function initErrorMock() {
  try {
    if (!isMounted()) {
      // Mount React app with Shadow DOM
      mount({ metas: apiMetas, config: runtimeConfig });
    }
  } catch (error) {
    console.error('[ErrorMock] Failed to initialize:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initErrorMock);
} else {
  initErrorMock();
}
`.trim();
}

/**
 * Development-only watcher for monorepo hot reload
 * Watches package build completion markers and triggers browser reload
 *
 * @internal Only for monorepo development, not for end users
 */
export interface ErrorMockDevWatcherOptions {
  /**
   * Package names to watch (relative to workspace packages directory)
   * @example ['ui', 'core']
   */
  watch: string[];

  /**
   * Workspace packages directory relative to project root
   * @default '../../packages'
   */
  packagesDir?: string;

  /**
   * Delay in ms before triggering reload (allows build to complete)
   * @default 500
   */
  reloadDelay?: number;
}

export function errorMockDevWatcher(options: ErrorMockDevWatcherOptions): Plugin {
  const { watch: watchPackages, packagesDir = '../../packages', reloadDelay = 500 } = options;

  return {
    name: 'error-mock-dev-watcher',
    // Only apply in serve mode
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      // Resolve packages directory
      const resolvedPackagesDir = path.resolve(server.config.root, packagesDir);

      // Watch each package's build completion marker
      watchPackages.forEach((pkg) => {
        const markerPath = path.normalize(
          path.resolve(resolvedPackagesDir, pkg, 'dist', '.build-complete')
        );

        // Add to watcher
        server.watcher.add(markerPath);

        let reloadTimer: NodeJS.Timeout | null = null;

        // Handler for marker changes
        const handleMarkerChange = (changedPath: string) => {
          const normalizedChangedPath = path.normalize(changedPath);

          if (normalizedChangedPath === markerPath) {
            console.log(`[dev-watcher] ${pkg} 包构建完成`);

            // Clear previous timer
            if (reloadTimer) clearTimeout(reloadTimer);

            // Delay to allow file writes to finish (especially on slower FS)
            reloadTimer = setTimeout(() => {
              if (!fs.existsSync(markerPath)) return;
              server.moduleGraph.invalidateAll();
              server.ws.send({ type: 'full-reload', path: '*' });
            }, reloadDelay);
          }
        };

        // Listen to both 'add' (first build) and 'change' (subsequent builds)
        server.watcher.on('add', handleMarkerChange);
        server.watcher.on('change', handleMarkerChange);
      });

      console.log(`[dev-watcher] 监听包: ${watchPackages.join(', ')}`);
    },
  };
}
