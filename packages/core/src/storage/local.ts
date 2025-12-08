import type { MockRule, GlobalConfig } from '../types';

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  enabled: true,
  defaultDelay: 0,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
};

export class RuleStorage {
  private prefix: string;

  constructor(prefix = 'error-mock') {
    this.prefix = prefix;
  }

  private get rulesKey(): string {
    return `${this.prefix}:rules`;
  }

  private get configKey(): string {
    return `${this.prefix}:config`;
  }

  saveRules(rules: MockRule[]): void {
    try {
      localStorage.setItem(this.rulesKey, JSON.stringify(rules));
    } catch (e) {
      console.error('[ErrorMock] Failed to save rules:', e);
    }
  }

  getRules(): MockRule[] {
    try {
      const data = localStorage.getItem(this.rulesKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[ErrorMock] Failed to read rules:', e);
      return [];
    }
  }

  updateRule(rule: MockRule): void {
    const rules = this.getRules();
    const index = rules.findIndex((r) => r.id === rule.id);
    if (index !== -1) {
      rules[index] = rule;
      this.saveRules(rules);
    }
  }

  clear(): void {
    localStorage.removeItem(this.rulesKey);
    localStorage.removeItem(this.configKey);
  }

  getGlobalConfig(): GlobalConfig {
    try {
      const data = localStorage.getItem(this.configKey);
      return data ? { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(data) } : DEFAULT_GLOBAL_CONFIG;
    } catch {
      return DEFAULT_GLOBAL_CONFIG;
    }
  }

  saveGlobalConfig(config: Partial<GlobalConfig>): void {
    try {
      const current = this.getGlobalConfig();
      localStorage.setItem(this.configKey, JSON.stringify({ ...current, ...config }));
    } catch (e) {
      console.error('[ErrorMock] Failed to save config:', e);
    }
  }

  exportConfig(): string {
    return JSON.stringify({
      rules: this.getRules(),
      config: this.getGlobalConfig(),
    }, null, 2);
  }

  importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.rules) this.saveRules(data.rules);
      if (data.config) this.saveGlobalConfig(data.config);
      return true;
    } catch {
      return false;
    }
  }
}
