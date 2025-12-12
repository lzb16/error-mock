import type { MockRule, GlobalConfig, RuleDefaults } from '../types';
import { DEFAULT_GLOBAL_CONFIG, DEFAULT_RULE_DEFAULTS } from '../constants';

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
      if (!data) return [];

      const rules = JSON.parse(data) as MockRule[];

      // Validate and normalize methods
      return rules.map((rule) => ({
        ...rule,
        method: this.normalizeMethod(rule.method),
      }));
    } catch (e) {
      console.error('[ErrorMock] Failed to read rules:', e);
      return [];
    }
  }

  private normalizeMethod(method: string | MockRule['method']): MockRule['method'] {
    const validMethods: MockRule['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const upper = (typeof method === 'string' ? method.toUpperCase() : method) as string;
    return validMethods.includes(upper as MockRule['method'])
      ? (upper as MockRule['method'])
      : 'GET';
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

  private mergeRuleDefaults(overrides?: Partial<RuleDefaults>): RuleDefaults {
    const businessOverrides = overrides?.business;
    return {
      ...DEFAULT_RULE_DEFAULTS,
      ...overrides,
      business: { ...DEFAULT_RULE_DEFAULTS.business, ...(businessOverrides || {}) },
    };
  }

  private mergeGlobalConfig(config?: Partial<GlobalConfig>): GlobalConfig {
    const { defaults, ...rest } = config || {};
    return {
      ...DEFAULT_GLOBAL_CONFIG,
      ...rest,
      defaults: this.mergeRuleDefaults(defaults),
    };
  }

  private isLegacyConfig(config: unknown): config is { defaultDelay?: number } {
    return typeof config === 'object' && config !== null && 'defaultDelay' in config;
  }

  private migrateLegacyConfig(config: { defaultDelay?: number } & Record<string, unknown>): GlobalConfig {
    const { defaultDelay, ...rest } = config;
    // Coerce defaultDelay to number, fall back to default if invalid
    const delay = typeof defaultDelay === 'number' && !isNaN(defaultDelay)
      ? defaultDelay
      : DEFAULT_RULE_DEFAULTS.delay;

    const legacyDefaults = this.mergeRuleDefaults({ delay });
    return {
      ...DEFAULT_GLOBAL_CONFIG,
      ...rest,
      defaults: legacyDefaults,
    };
  }

  getGlobalConfig(): GlobalConfig {
    try {
      const data = localStorage.getItem(this.configKey);
      if (!data) return DEFAULT_GLOBAL_CONFIG;

      const parsed = JSON.parse(data);
      if (this.isLegacyConfig(parsed)) {
        const migrated = this.migrateLegacyConfig(parsed);
        // Persist migrated config to avoid repeated migration
        try {
          localStorage.setItem(this.configKey, JSON.stringify(migrated));
        } catch {
          // Ignore storage errors during auto-migration
        }
        return migrated;
      }

      return this.mergeGlobalConfig(parsed);
    } catch {
      return DEFAULT_GLOBAL_CONFIG;
    }
  }

  saveGlobalConfig(config: Partial<GlobalConfig>): void {
    try {
      const current = this.getGlobalConfig();
      // Support legacy callers that might still pass defaultDelay
      const legacyDelay = (config as unknown as { defaultDelay?: number }).defaultDelay;
      const mergedDefaults =
        config.defaults || legacyDelay !== undefined
          ? this.mergeRuleDefaults({
              ...config.defaults,
              delay: legacyDelay ?? config.defaults?.delay
            })
          : current.defaults;

      const next = this.mergeGlobalConfig({ ...config, defaults: mergedDefaults });

      // Remove defaultDelay if it leaked through
      const cleaned = { ...next };
      delete (cleaned as any).defaultDelay;

      localStorage.setItem(this.configKey, JSON.stringify(cleaned));
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
      if (data.rules) {
        // Normalize methods before saving
        const normalizedRules = data.rules.map((rule: MockRule) => ({
          ...rule,
          method: this.normalizeMethod(rule.method),
        }));
        this.saveRules(normalizedRules);
      }
      if (data.config) this.saveGlobalConfig(data.config);
      return true;
    } catch {
      return false;
    }
  }
}
