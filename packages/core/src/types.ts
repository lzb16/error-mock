export interface NetworkConfig {
  delay: number;
  timeout: boolean;
  offline: boolean;
  failRate: number;
}

export interface BusinessConfig {
  errNo: number;
  errMsg: string;
  detailErrMsg: string;
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
  mockType: 'none' | 'success' | 'businessError' | 'networkError';
  network: NetworkConfig;
  business: BusinessConfig;
  response: {
    useDefault: boolean;
    customResult: unknown;
  };
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
  defaultDelay: number;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'dark' | 'light' | 'system';
  keyboardShortcuts: boolean;
}

export interface BypassConfig {
  origins: string[];
  methods: string[];
  contentTypes: string[];
  urlPatterns: RegExp[];
}
