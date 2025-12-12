import type { BusinessConfig, GlobalConfig, RuleDefaults } from './types';

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  errNo: 0,
  errMsg: '',
  detailErrMsg: '',
};

export const DEFAULT_RULE_DEFAULTS: RuleDefaults = {
  delay: 0,
  mockType: 'none',
  failRate: 0,
  timeout: false,
  offline: false,
  business: { ...DEFAULT_BUSINESS_CONFIG },
};

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  enabled: true,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
  defaults: { ...DEFAULT_RULE_DEFAULTS },
};
