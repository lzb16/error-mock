import { createRoot, type Root } from 'react-dom/client';
import type { ApiMeta, GlobalConfig } from '@error-mock/core';
import { App } from './App';
import { ShadowRootProvider } from './context/ShadowRootContext';
import { I18nProvider, resolveLocale, useLocaleStore, type Locale } from './i18n';
import { useConfigStore } from './stores/useConfigStore';
// @ts-expect-error Vite handles ?inline imports
import rawStyles from './styles/globals.css?inline';

let root: Root | null = null;
let hostElement: HTMLElement | null = null;

export interface MountOptions {
  metas: ApiMeta[];
  /**
   * UI locale. Default: 'zh'
   *
   * When provided, this value wins over persisted locale.
   */
  locale?: Locale;
  /**
   * Runtime-only config overrides (not persisted).
   *
   * Useful for environment-specific settings, e.g. stripping proxy prefixes
   * before matching rules.
   */
  config?: Partial<GlobalConfig>;
}

const GLOBAL_STYLE_ID = 'error-mock-global-properties';

/**
 * Extract @property rules from CSS.
 * @property rules must be in document scope to work, they don't work inside Shadow DOM.
 * @see https://github.com/tailwindlabs/tailwindcss/issues/15005
 */
function extractAtPropertyRules(css: string): string {
  const matches = css.match(/@property\s+--[\w-]+\s*\{[^}]+\}/g);
  return matches ? matches.join('\n') : '';
}

/**
 * Process CSS for Shadow DOM:
 * - Remove selectors that would leak to host page (html, body)
 * - Keep :host selectors intact
 */
function processCSSForShadowDOM(css: string): string {
  return css
    // "html,:host{...}" -> ":host{...}"
    .replace(/html\s*,\s*:host\s*\{/g, ':host{')
    // ":root,:host{...}" -> ":host{...}"
    .replace(/:root\s*,\s*:host\s*\{/g, ':host{');
}

/**
 * Inject @property rules to document.head (required for Shadow DOM compatibility).
 * These rules are global by CSS spec, but needed for Tailwind utilities to work.
 */
function injectGlobalPropertyRules(css: string): void {
  if (document.getElementById(GLOBAL_STYLE_ID)) return;

  const atProperties = extractAtPropertyRules(css);
  if (!atProperties) return;

  const style = document.createElement('style');
  style.id = GLOBAL_STYLE_ID;
  style.textContent = atProperties;
  document.head.appendChild(style);
}

/**
 * Remove injected global styles (cleanup on unmount).
 */
function removeGlobalPropertyRules(): void {
  document.getElementById(GLOBAL_STYLE_ID)?.remove();
}

// Process styles once at module load
const styles = processCSSForShadowDOM(rawStyles);

export function mount(options: MountOptions): void {
  // 幂等性检查：防止重复挂载
  if (root) {
    console.warn('[ErrorMock] Already mounted, skipping');
    return;
  }

  // DOM 可用性检查
  if (!document.body) {
    console.error('[ErrorMock] document.body not available');
    return;
  }

  // Inject @property rules to document.head for Shadow DOM compatibility
  // @see https://github.com/tailwindlabs/tailwindcss/issues/15005
  injectGlobalPropertyRules(rawStyles);

  // 1. 创建或复用 Shadow Host (使用自定义标签避免被 div 规则命中)
  const existingHost = document.getElementById('error-mock-root');
  if (existingHost) {
    hostElement = existingHost as HTMLElement;
  } else {
    // 使用自定义元素避免被宿主页面的 div { ... } 规则影响
    hostElement = document.createElement('error-mock-root') as HTMLElement;
    hostElement.id = 'error-mock-root';
    document.body.appendChild(hostElement);
  }

  // 定向重置 - 只重置可能被污染的属性，不用 all:initial 以保留 CSS 变量继承
  hostElement.style.cssText = `
    display: block !important;
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    box-sizing: border-box !important;
    font: inherit !important;
    color: inherit !important;
    line-height: normal !important;
    text-decoration: none !important;
    pointer-events: auto !important;
  `.replace(/\s+/g, ' ').trim();

  // 2. 创建或复用 Shadow Root
  let shadowRoot = hostElement.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = hostElement.attachShadow({ mode: 'open' });
  }

  // 3. 注入样式（仅当不存在时）
  if (!shadowRoot.querySelector('style[data-error-mock-styles]')) {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-error-mock-styles', '');
    styleEl.textContent = styles;
    shadowRoot.appendChild(styleEl);
  }

  // 4. 创建 React 容器（仅当不存在时）
  let container = shadowRoot.getElementById('error-mock-app');
  if (!container) {
    container = document.createElement('div');
    container.id = 'error-mock-app';
    container.setAttribute('data-error-mock-ui', '');
    shadowRoot.appendChild(container);
  }

  // 5. 创建 Portal 容器（仅当不存在时）
  let portalContainer = shadowRoot.getElementById('error-mock-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'error-mock-portal';
    portalContainer.setAttribute('data-error-mock-ui', '');
    shadowRoot.appendChild(portalContainer);
  }

  // 6. 挂载 React
  root = createRoot(container);

  // Apply initial locale before first render
  if (options.locale) {
    useLocaleStore.getState().setLocale(resolveLocale(options.locale));
  }

  // Apply runtime-only overrides (not persisted)
  if (options.config) {
    useConfigStore.getState().setRuntimeConfig(options.config);
  } else {
    useConfigStore.getState().clearRuntimeConfig();
  }

  root.render(
    <ShadowRootProvider shadowRoot={shadowRoot}>
      <I18nProvider>
        <App metas={options.metas} />
      </I18nProvider>
    </ShadowRootProvider>
  );
}

export function unmount(): void {
  if (root) {
    root.unmount();
    root = null;
  }
  if (hostElement) {
    hostElement.remove();
    hostElement = null;
  }
  // Clean up global @property rules
  removeGlobalPropertyRules();
  useConfigStore.getState().clearRuntimeConfig();
}

export function isMounted(): boolean {
  return root !== null;
}
