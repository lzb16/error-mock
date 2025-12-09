interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

interface ResponseWrapper<T> {
  code: number;
  message: string;
  result: T;
}

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

    const queryString = method === 'GET' && params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';

    const response = await fetch(url + queryString, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResponseWrapper<TRes> = await response.json();

    if (data.code !== 0) {
      throw new Error(data.message || 'Request failed');
    }

    return data.result;
  };
}
