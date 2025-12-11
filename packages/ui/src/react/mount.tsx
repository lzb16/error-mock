import { createRoot, type Root } from 'react-dom/client';
import { App } from './App';
import { ShadowRootProvider } from './context/ShadowRootContext';
// @ts-expect-error Vite handles ?inline imports
import styles from './styles/globals.css?inline';

let root: Root | null = null;
let hostElement: HTMLElement | null = null;

export interface MountOptions {
  metas: Array<{ url: string; method: string }>;
}

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
  root.render(
    <ShadowRootProvider shadowRoot={shadowRoot}>
      <App metas={options.metas} />
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
}

export function isMounted(): boolean {
  return root !== null;
}
