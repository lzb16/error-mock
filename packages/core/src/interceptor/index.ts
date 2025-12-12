// packages/core/src/interceptor/index.ts
import type { MockRule, BypassConfig, GlobalConfig } from '../types';
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

export function install(
  rules: MockRule[],
  config?: GlobalConfig,
  bypass?: Partial<BypassConfig>
): void {
  installFetchInterceptor(rules, config, bypass);
  installXHRInterceptor(rules, config, bypass);
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
