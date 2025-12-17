import type { MockRule, GlobalConfig } from '../types';
import {
  DEFAULT_GLOBAL_CONFIG,
  STORAGE_SCHEMA_VERSION,
} from '../constants';

interface StoredData {
  version?: number;
  rules: MockRule[];
}

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
      const data: StoredData = {
        version: STORAGE_SCHEMA_VERSION,
        rules,
      };
      localStorage.setItem(this.rulesKey, JSON.stringify(data));
    } catch (e) {
      console.error('[ErrorMock] Failed to save rules:', e);
    }
  }

  getRules(): MockRule[] {
    try {
      const raw = localStorage.getItem(this.rulesKey);
      if (!raw) return [];

      const parsed = JSON.parse(raw);

      // Check version and clear if outdated
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'version' in parsed &&
        'rules' in parsed
      ) {
        const data = parsed as StoredData;
        if (data.version !== STORAGE_SCHEMA_VERSION) {
          // Clear outdated data
          console.warn('[ErrorMock] Storage schema outdated, clearing data');
          this.clear();
          return [];
        }

        const rules = Array.isArray(data.rules) ? data.rules : [];
        return rules.map((rule) => ({
          ...rule,
          method: this.normalizeMethod(rule.method),
        }));
      }

      // Old format without version, clear it
      console.warn('[ErrorMock] Storage schema outdated, clearing data');
      this.clear();
      return [];
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

  getGlobalConfig(): GlobalConfig {
    try {
      const data = localStorage.getItem(this.configKey);
      if (!data) return { ...DEFAULT_GLOBAL_CONFIG };

      const parsed = JSON.parse(data) as Partial<GlobalConfig>;
      const parsedMatch = (parsed as Partial<GlobalConfig> & { match?: unknown }).match;
      const matchObject =
        typeof parsedMatch === 'object' && parsedMatch !== null
          ? (parsedMatch as Record<string, unknown>)
          : null;
      const stripPrefixes =
        Array.isArray(matchObject?.stripPrefixes) &&
        matchObject?.stripPrefixes.every((p) => typeof p === 'string')
          ? (matchObject.stripPrefixes as string[])
          : DEFAULT_GLOBAL_CONFIG.match?.stripPrefixes ?? [];

      // Merge with defaults to ensure all fields exist
      return {
        enabled: parsed.enabled ?? DEFAULT_GLOBAL_CONFIG.enabled,
        position: parsed.position ?? DEFAULT_GLOBAL_CONFIG.position,
        theme: parsed.theme ?? DEFAULT_GLOBAL_CONFIG.theme,
        keyboardShortcuts: parsed.keyboardShortcuts ?? DEFAULT_GLOBAL_CONFIG.keyboardShortcuts,
        networkProfile: parsed.networkProfile ?? DEFAULT_GLOBAL_CONFIG.networkProfile,
        match: {
          stripPrefixes,
        },
      };
    } catch {
      return { ...DEFAULT_GLOBAL_CONFIG };
    }
  }

  saveGlobalConfig(config: Partial<GlobalConfig>): void {
    try {
      const current = this.getGlobalConfig();
      const next: GlobalConfig = { ...current, ...config };
      localStorage.setItem(this.configKey, JSON.stringify(next));
    } catch (e) {
      console.error('[ErrorMock] Failed to save config:', e);
    }
  }

  exportConfig(): string {
    return JSON.stringify(
      {
        version: STORAGE_SCHEMA_VERSION,
        rules: this.getRules(),
        config: this.getGlobalConfig(),
      },
      null,
      2
    );
  }

  importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json);

      // Import rules
      if (data.rules && Array.isArray(data.rules)) {
        const normalizedRules = data.rules.map((rule: MockRule) => ({
          ...rule,
          method: this.normalizeMethod(rule.method),
        }));
        this.saveRules(normalizedRules);
      }

      // Import config
      if (data.config) {
        this.saveGlobalConfig(data.config);
      }

      return true;
    } catch (e) {
      console.error('[ErrorMock] Failed to import config:', e);
      return false;
    }
  }
}
