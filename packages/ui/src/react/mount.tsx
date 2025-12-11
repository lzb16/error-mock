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

  // 1. 创建或复用 Shadow Host
  const existingHost = document.getElementById('error-mock-root');
  if (existingHost) {
    hostElement = existingHost;
  } else {
    hostElement = document.createElement('div');
    hostElement.id = 'error-mock-root';
    document.body.appendChild(hostElement);
  }

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
