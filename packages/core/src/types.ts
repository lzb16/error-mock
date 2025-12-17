export type FloatButtonPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export type ThemeMode = 'dark' | 'light' | 'system';

export type NetworkProfile = 'none' | 'fast4g' | 'slow3g' | '2g';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface MatchConfig {
  /**
   * Strip these prefixes from the request URL pathname before matching rules.
   *
   * Useful when dev proxy adds a fixed prefix (e.g. `/api`), but your API
   * definitions/rules are stored without it (e.g. `/user/login`).
   *
   * Example: request `/api/user/login` + stripPrefixes [`/api`] => match `/user/login`.
   */
  stripPrefixes?: string[];
}

export interface NetworkConfig {
  profile?: NetworkProfile | null; // null = follow global
  customDelay?: number; // Custom delay in ms
  errorMode?: 'timeout' | 'offline' | null;
  failRate?: number; // Random failure rate (0-100)
}

export interface ResponseConfig {
  status: number; // HTTP status code (default 200)
  // Business error config (used when status=200)
  errNo: number; // 0 = success
  errMsg: string;
  detailErrMsg: string;
  result: unknown; // Response data
  // Custom error body (used when status>=400, optional)
  errorBody?: unknown;
}

export interface FieldOmitConfig {
  enabled: boolean;
  mode: 'manual' | 'random';
  fields: string[];
  random: {
    probability: number;
    maxOmitCount: number;
    excludeFields: string[];
    depthLimit: number;
    omitMode: 'delete' | 'undefined' | 'null';
    seed?: number;
  };
}

export interface MockRule {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  enabled: boolean;
  response: ResponseConfig;
  network: NetworkConfig;
  fieldOmit: FieldOmitConfig;
}

export interface ApiMeta {
  module: string;
  name: string;
  url: string;
  method: string;
  requestType?: string;
  responseType?: string;
}

export interface ApiResponse<T = unknown> {
  err_no: number;
  err_msg: string;
  detail_err_msg: string;
  result: T;
  sync: boolean;
  time_stamp: number;
  time_zone_ID: string;
  time_zone_offset: number;
  trace_id: string;
}

export interface GlobalConfig {
  enabled: boolean;
  position: FloatButtonPosition;
  theme: ThemeMode;
  keyboardShortcuts: boolean;
  networkProfile: NetworkProfile; // Global network profile (default 'none')
  logLevel: LogLevel; // Log level for debugging (default 'warn')
  match?: MatchConfig;
}

export interface BypassConfig {
  origins: string[];
  methods: string[];
  contentTypes: string[];
  urlPatterns: RegExp[];
}
