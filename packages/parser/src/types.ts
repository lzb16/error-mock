export interface ApiMeta {
  module: string;
  name: string;
  url: string;
  method: string;
  requestType?: string;
  responseType?: string;
}

export interface AdapterOptions {
  /**
   * Default HTTP method when not specified in API definition.
   * @default 'GET'
   */
  defaultMethod?: string;
}

export interface ApiAdapter {
  parse(apiDir: string): ApiMeta[];
}

export interface ParserOptions {
  apiDir: string;
  adapter?: ApiAdapter;
}
