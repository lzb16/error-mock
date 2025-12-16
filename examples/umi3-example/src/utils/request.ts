export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

type ResponseWrapper<T> =
  | {
      // Typical backend shape
      code: number;
      message: string;
      result: T;
    }
  | {
      // @error-mock/core default response shape
      err_no: number;
      err_msg: string;
      detail_err_msg: string;
      result: T;
    };

/**
 * Minimal request factory used by the parser example.
 * The Error Mock parser only needs the `createRequest<Res, Req>({ url, method })` pattern.
 */
export function createRequest<TRes, TReq = void>(config: RequestConfig) {
  return async (params?: TReq): Promise<TRes> => {
    const { url, method = 'GET' } = config;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && params !== undefined) {
      options.body = JSON.stringify(params);
    }

    const queryString =
      method === 'GET' && params ? '?' + new URLSearchParams(params as any).toString() : '';

    const response = await fetch(url + queryString, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResponseWrapper<TRes> = await response.json();

    if ('code' in data) {
      if (data.code !== 0) {
        throw new Error(data.message || 'Request failed');
      }
      return data.result;
    }

    if (data.err_no !== 0) {
      throw new Error(data.detail_err_msg || data.err_msg || 'Request failed');
    }

    return data.result;
  };
}
