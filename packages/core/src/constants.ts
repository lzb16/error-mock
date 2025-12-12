import type { GlobalConfig, ResponseConfig, NetworkConfig, FieldOmitConfig } from './types';

// Storage schema version for migration
export const STORAGE_SCHEMA_VERSION = 2;

// Default response configuration
export const DEFAULT_RESPONSE_CONFIG: ResponseConfig = {
  status: 200,
  errNo: 0,
  errMsg: '',
  detailErrMsg: '',
  result: {},
  errorBody: undefined,
};

// Default network configuration
export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  profile: null, // Follow global profile
  customDelay: undefined,
  errorMode: null,
  failRate: 0,
};

// Default field omit configuration
export const DEFAULT_FIELD_OMIT_CONFIG: FieldOmitConfig = {
  enabled: false,
  mode: 'manual',
  fields: [],
  random: {
    probability: 50,
    maxOmitCount: 3,
    excludeFields: [],
    depthLimit: 3,
    omitMode: 'undefined',
  },
};

// Default global configuration
export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  enabled: true,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
  networkProfile: 'none',
};

// Network profile delay mappings (in milliseconds)
export const PROFILE_DELAYS: Record<string, number> = {
  none: 0,
  fast4g: 150,
  slow3g: 500,
  '2g': 1500,
};
