import type { Plugin, ResolvedConfig } from 'vite';
import { createDefaultAdapter, type ApiAdapter, type ApiMeta } from '@error-mock/parser';
import path from 'path';

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

    transformIndexHtml(html) {
      // Generate runtime code
      const runtimeCode = generateRuntimeCode(apiMetas);

      // Return HTML transformation
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: runtimeCode,
          injectTo: 'body',
        },
      ];
    },
  };
}

function generateRuntimeCode(apiMetas: ApiMeta[]): string {
  return `
// Error Mock Runtime - Auto-injected by vite plugin
(async () => {
  try {
    const { install } = await import('@error-mock/core');
    const { App } = await import('@error-mock/ui');
    await import('@error-mock/ui/dist/style.css');

    // API metadata from build time
    const apiMetas = ${JSON.stringify(apiMetas, null, 2)};

    // Create container
    const container = document.createElement('div');
    container.id = 'error-mock-root';
    document.body.appendChild(container);

    // Install interceptor with empty rules (will load from storage)
    install([]);

    // Mount Svelte app
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
})();
`.trim();
}

// Default export
export default errorMockVitePlugin;
