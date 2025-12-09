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
    // Only apply in development mode - prioritize explicit mode setting
    if (compiler.options.mode === 'production') {
      return;
    }

    const isDev =
      compiler.options.mode === 'development' ||
      process.env.NODE_ENV === 'development' ||
      !!compiler.options.devServer;

    if (!isDev) {
      if (compiler.options.mode === undefined) {
        console.warn('[ErrorMock] Webpack mode is undefined, plugin may not activate. Set mode: "development" in webpack config.');
      }
      return;
    }

    const pluginName = 'ErrorMockWebpackPlugin';
    let apiMetas: ApiMeta[] = [];

    // Parse API directory once during compilation setup
    compiler.hooks.beforeCompile.tapAsync(pluginName, (params, callback) => {
      try {
        const fullPath = path.resolve(compiler.context, this.options.apiDir);
        apiMetas = this.options.adapter.parse(fullPath);
        console.log(`[ErrorMock] Parsed ${apiMetas.length} APIs from ${fullPath}`);
      } catch (error) {
        console.warn(`[ErrorMock] Failed to parse API directory`, error);
        apiMetas = [];
      }
      callback();
    });

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // Hook into HtmlWebpackPlugin
      const hooks = HtmlWebpackPlugin.getHooks(compilation);

      hooks.alterAssetTags.tapAsync(pluginName, (data, callback) => {
        try {
          // Inject script tag that references the emitted runtime module
          data.assetTags.scripts.push({
            tagName: 'script',
            voidTag: false,
            meta: { plugin: pluginName },
            attributes: {
              type: 'module',
              src: '/error-mock-runtime.js',
            },
          });

          callback(null, data);
        } catch (error) {
          callback(error as Error, data);
        }
      });
    });

    // Emit runtime module as asset
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const runtimeCode = this.generateRuntimeCode(apiMetas);
          compilation.emitAsset(
            'error-mock-runtime.js',
            new compiler.webpack.sources.RawSource(runtimeCode)
          );
        }
      );
    });
  }

  private generateRuntimeCode(apiMetas: ApiMeta[]): string {
    return `
// Error Mock Runtime - Auto-injected by webpack plugin
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
}

// Default export
export default ErrorMockWebpackPlugin;
