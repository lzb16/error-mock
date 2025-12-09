import type { Plugin, ResolvedConfig } from 'vite';
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
}

/**
 * Vite plugin for Error Mock
 * Injects error mock UI and runtime into development builds
 */
export function errorMockVitePlugin(options: ErrorMockVitePluginOptions = {}): Plugin {
  const opts: Required<ErrorMockVitePluginOptions> = {
    apiDir: options.apiDir || 'src/api',
    adapter: options.adapter || createDefaultAdapter(),
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
        console.log(`[ErrorMock] Parsed ${apiMetas.length} APIs from ${fullPath}`);
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
        return generateRuntimeCode(apiMetas);
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

function generateRuntimeCode(apiMetas: ApiMeta[]): string {
  return `
// Error Mock Runtime - Auto-injected by vite plugin
import { App } from '@error-mock/ui';
import '@error-mock/ui/style.css';

// API metadata from build time
const apiMetas = ${JSON.stringify(apiMetas, null, 2)};

function initErrorMock() {
  try {
    // Create container
    const container = document.createElement('div');
    container.id = 'error-mock-root';
    document.body.appendChild(container);

    // Mount Svelte app (it will handle install with saved rules)
    new App({
      target: container,
      props: {
        metas: apiMetas
      }
    });

    console.log('[ErrorMock] Initialized with', apiMetas.length, 'APIs');
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

// Default export
export default errorMockVitePlugin;
