import type { Compiler } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createDefaultAdapter, type ApiAdapter, type ApiMeta } from '@error-mock/parser';
import path from 'path';

export interface ErrorMockWebpackPluginOptions {
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
 * Webpack plugin for Error Mock
 * Injects error mock UI and runtime into development builds
 */
export class ErrorMockWebpackPlugin {
  private options: Required<ErrorMockWebpackPluginOptions>;

  constructor(options: ErrorMockWebpackPluginOptions = {}) {
    this.options = {
      apiDir: options.apiDir || 'src/api',
      adapter: options.adapter || createDefaultAdapter(),
    };
  }

  apply(compiler: Compiler): void {
    // Only apply in development mode
    if (compiler.options.mode !== 'development') {
      return;
    }

    const pluginName = 'ErrorMockWebpackPlugin';

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // Hook into HtmlWebpackPlugin
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.alterAssetTags.tapAsync(pluginName, (data, callback) => {
        try {
          // Resolve API directory path
          const fullPath = path.resolve(compiler.context, this.options.apiDir);

          // Parse API directory
          let apiMetas: ApiMeta[] = [];
          try {
            apiMetas = this.options.adapter.parse(fullPath);
          } catch (error) {
            console.warn(`[ErrorMock] Failed to parse API directory: ${fullPath}`, error);
          }

          // Generate runtime code
          const runtimeCode = this.generateRuntimeCode(apiMetas);

          // Inject script tag
          data.assetTags.scripts.push({
            tagName: 'script',
            voidTag: false,
            meta: { plugin: pluginName },
            attributes: {
              type: 'module',
            },
            innerHTML: runtimeCode,
          });

          callback(null, data);
        } catch (error) {
          callback(error as Error, data);
        }
      });
    });
  }

  private generateRuntimeCode(apiMetas: ApiMeta[]): string {
    return `
// Error Mock Runtime - Auto-injected by webpack plugin
(async () => {
  try {
    const { install, updateRules } = await import('@error-mock/core');
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
}

// Default export
export default ErrorMockWebpackPlugin;
