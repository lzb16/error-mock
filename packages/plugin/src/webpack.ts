import type { Compiler } from 'webpack';
import { createDefaultAdapter, type ApiAdapter, type ApiMeta } from '@error-mock/parser';
import path from 'path';
import fs from 'fs';

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

  /**
   * Where to write the generated runtime entry file (relative to project root).
   *
   * Default is `node_modules/.cache/error-mock` to avoid being picked up by
   * framework-level file watchers (e.g. Umi) and causing dev-server restart loops.
   */
  runtimeDir?: string;

  /**
   * Enable debug logs (or set env `ERROR_MOCK_DEBUG=1`).
   */
  debug?: boolean;

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

const PLUGIN_NAME = 'ErrorMockWebpackPlugin';
const DEFAULT_RUNTIME_DIR = path.join('node_modules', '.cache', 'error-mock');
const FALLBACK_RUNTIME_DIR = '.error-mock';
const RUNTIME_ENTRY_FILENAME = 'error-mock-runtime-entry.js';

/**
 * Webpack plugin for Error Mock
 * Supports both webpack 4 and webpack 5
 */
export class ErrorMockWebpackPlugin {
  private options: Required<ErrorMockWebpackPluginOptions>;
  private runtimeEntryPath: string | null = null;
  private lastRuntimeCode: string | null = null;
  private entryInjected = false;
  private debugEnabled = false;
  private lastParsedApiCount: number | null = null;

  constructor(options: ErrorMockWebpackPluginOptions = {}) {
    this.options = {
      apiDir: options.apiDir || 'src/api',
      adapter: options.adapter || createDefaultAdapter(),
      runtimeDir: options.runtimeDir || DEFAULT_RUNTIME_DIR,
      debug: options.debug ?? false,
      match: options.match || {},
    };
    this.debugEnabled = this.options.debug || process.env.ERROR_MOCK_DEBUG === '1';
  }

  apply(compiler: Compiler): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compilerAny = compiler as any;
    const webpackVersion = compilerAny.webpack?.version || '4.x (no compiler.webpack)';
    if (this.debugEnabled) {
      console.log(`[ErrorMock][build] Webpack version: ${webpackVersion}`);
    }

    if (compiler.options.mode === 'production') {
      return;
    }

    const isDev =
      compiler.options.mode === 'development' ||
      process.env.NODE_ENV === 'development' ||
      !!compiler.options.devServer;

    if (!isDev) {
      if (compiler.options.mode === undefined) {
        console.warn('[ErrorMock] Webpack mode is undefined, plugin may not activate.');
      }
      return;
    }

    let apiMetas: ApiMeta[] = [];

    this.runtimeEntryPath = this.resolveRuntimeEntryPath(compiler.context);
    this.ensureRuntimeEntryInjected(compiler);

    const apiDirAbsPath = path.resolve(compiler.context, this.options.apiDir);
    if (this.debugEnabled) {
      compiler.hooks.invalid.tap(PLUGIN_NAME, (fileName) => {
        console.log(`[ErrorMock][debug] Webpack invalidated by: ${fileName || '(unknown)'}`);
      });
    }
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      // Make webpack watch the API directory even if it's not in the module graph.
      // This helps both plain webpack and framework integrations.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compAny = compilation as any;
      const deps = compAny.contextDependencies;
      if (!deps) return;
      if (typeof deps.add === 'function') {
        deps.add(apiDirAbsPath);
        return;
      }
      if (Array.isArray(deps) && !deps.includes(apiDirAbsPath)) {
        deps.push(apiDirAbsPath);
      }
    });

    compiler.hooks.beforeCompile.tapAsync(PLUGIN_NAME, (_params, callback) => {
      try {
        apiMetas = this.normalizeApiMetas(this.options.adapter.parse(apiDirAbsPath));
        const nextCount = apiMetas.length;
        const prevCount = this.lastParsedApiCount;
        this.lastParsedApiCount = nextCount;

        if (this.debugEnabled || prevCount === null || prevCount !== nextCount) {
          console.log(`[ErrorMock][build] Parsed ${nextCount} APIs from ${apiDirAbsPath}`);
        }
      } catch (error) {
        console.warn(`[ErrorMock] Failed to parse API directory`, error);
        apiMetas = [];
      }

      try {
        const runtimeCode = this.generateRuntimeCode(apiMetas);
        this.writeRuntimeEntryFile(runtimeCode);
      } catch (error) {
        console.warn('[ErrorMock] Failed to generate runtime entry file', error);
      }
      callback();
    });
  }

  private resolveRuntimeEntryPath(projectRoot: string): string {
    const candidates = [
      this.options.runtimeDir,
      DEFAULT_RUNTIME_DIR,
      FALLBACK_RUNTIME_DIR, // keep compatibility if node_modules is unwritable / absent
    ].filter(Boolean) as string[];

    for (const runtimeDir of candidates) {
      const absDir = path.isAbsolute(runtimeDir) ? runtimeDir : path.resolve(projectRoot, runtimeDir);
      try {
        fs.mkdirSync(absDir, { recursive: true });
        return path.join(absDir, RUNTIME_ENTRY_FILENAME);
      } catch {
        // try next
      }
    }

    // If all candidates fail, fall back to the project root (should be writable in dev).
    return path.resolve(projectRoot, RUNTIME_ENTRY_FILENAME);
  }

  private ensureRuntimeEntryInjected(compiler: Compiler): void {
    if (this.entryInjected) return;
    if (!this.runtimeEntryPath) return;

    this.entryInjected = true;
    this.ensureRuntimeEntryFileExists();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalEntry: any = compiler.options.entry;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtimeEntryPath: any = this.runtimeEntryPath;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const append = (entry: any): any => {
      if (!entry) return entry;

      if (typeof entry === 'string') {
        return entry === runtimeEntryPath ? entry : [entry, runtimeEntryPath];
      }

      if (Array.isArray(entry)) {
        return entry.includes(runtimeEntryPath) ? entry : [...entry, runtimeEntryPath];
      }

      if (typeof entry === 'function') {
        return (...args: unknown[]) => {
          try {
            const result = entry(...args);
            return Promise.resolve(result).then((resolved) => append(resolved));
          } catch (error) {
            return Promise.reject(error);
          }
        };
      }

      if (typeof entry === 'object') {
        const next: Record<string, unknown> = { ...entry };

        for (const [key, value] of Object.entries(next)) {
          // webpack 5 entry description object: { import: string | string[], ... }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const asAny = value as any;
          if (asAny && typeof asAny === 'object' && !Array.isArray(asAny) && 'import' in asAny) {
            const currentImport = asAny.import;
            const imports = Array.isArray(currentImport)
              ? currentImport
              : currentImport
                ? [currentImport]
                : [];
            next[key] = {
              ...asAny,
              import: imports.includes(runtimeEntryPath) ? imports : [...imports, runtimeEntryPath],
            };
            continue;
          }

          next[key] = append(value);
        }

        return next;
      }

      return entry;
    };

    compiler.options.entry = append(originalEntry);
  }

  private ensureRuntimeEntryFileExists(): void {
    if (!this.runtimeEntryPath) return;
    try {
      fs.mkdirSync(path.dirname(this.runtimeEntryPath), { recursive: true });
      const initialCode = this.generateRuntimeCode([]);
      if (fs.existsSync(this.runtimeEntryPath)) {
        this.lastRuntimeCode = fs.readFileSync(this.runtimeEntryPath, 'utf8');
        return;
      }
      fs.writeFileSync(this.runtimeEntryPath, initialCode, 'utf8');
      this.lastRuntimeCode = initialCode;
    } catch (error) {
      console.warn('[ErrorMock] Failed to prepare runtime entry file', error);
    }
  }

  private writeRuntimeEntryFile(code: string): void {
    if (!this.runtimeEntryPath) return;
    if (this.lastRuntimeCode === code) return;

    try {
      fs.mkdirSync(path.dirname(this.runtimeEntryPath), { recursive: true });
      fs.writeFileSync(this.runtimeEntryPath, code, 'utf8');
      this.lastRuntimeCode = code;
      if (this.debugEnabled) {
        console.log(`[ErrorMock][debug] Wrote runtime entry: ${this.runtimeEntryPath}`);
      }
    } catch (error) {
      console.warn('[ErrorMock] Failed to write runtime entry file', error);
    }
  }

  private normalizeApiMetas(apiMetas: ApiMeta[]): ApiMeta[] {
    // Ensure deterministic output so the generated runtime entry file doesn't
    // change spuriously and cause repeated rebuild/restart loops.
    return [...apiMetas].sort((a, b) => {
      const keyA = `${a.module}\u0000${a.name}\u0000${a.method}\u0000${a.url}`;
      const keyB = `${b.module}\u0000${b.name}\u0000${b.method}\u0000${b.url}`;
      return keyA.localeCompare(keyB);
    });
  }

  private generateRuntimeCode(apiMetas: ApiMeta[]): string {
    return `
// Error Mock Runtime - Auto-injected by webpack plugin
// NOTE: This file is bundled by webpack (do NOT load it directly in browser as a bare module).
import { mount, isMounted } from '@error-mock/plugin/runtime';

const apiMetas = ${JSON.stringify(apiMetas, null, 2)};
const __ERROR_MOCK_DEBUG__ = ${JSON.stringify(this.debugEnabled)};
const runtimeConfig = ${JSON.stringify({ match: this.options.match }, null, 2)};

function initErrorMock() {
  try {
    if (!isMounted()) {
      mount({ metas: apiMetas, config: runtimeConfig });
      if (__ERROR_MOCK_DEBUG__) {
        console.log('[ErrorMock][runtime] Mounted with', apiMetas.length, 'APIs');
      }
    } else if (__ERROR_MOCK_DEBUG__) {
      console.log('[ErrorMock][runtime] Already mounted, skipping');
    }
  } catch (error) {
    console.error('[ErrorMock] Failed to initialize:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initErrorMock);
} else {
  initErrorMock();
}
`.trim();
  }
}

export default ErrorMockWebpackPlugin;
