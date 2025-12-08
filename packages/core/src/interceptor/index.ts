// packages/core/src/interceptor/index.ts
import type { MockRule, BypassConfig } from '../types';
import {
  installFetchInterceptor,
  uninstallFetchInterceptor,
  updateRules as updateFetchRules,
} from './fetch';
import {
  installXHRInterceptor,
  uninstallXHRInterceptor,
  updateRules as updateXHRRules,
} from './xhr';

export function install(rules: MockRule[], bypass?: Partial<BypassConfig>): void {
  installFetchInterceptor(rules, bypass);
  installXHRInterceptor(rules, bypass);
}

export function uninstall(): void {
  uninstallFetchInterceptor();
  uninstallXHRInterceptor();
}

export function updateRules(rules: MockRule[]): void {
  updateFetchRules(rules);
  updateXHRRules(rules);
}

export { installFetchInterceptor, uninstallFetchInterceptor } from './fetch';
export { installXHRInterceptor, uninstallXHRInterceptor } from './xhr';
