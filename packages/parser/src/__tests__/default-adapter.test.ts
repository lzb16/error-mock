import { describe, it, expect } from 'vitest';
import { parseApiFile } from '../adapters/default';

describe('parseApiFile', () => {
  it('extracts API metadata from createRequest pattern', () => {
    const code = `
      export const getUserUrl = '/api/user/info';
      export const getUser = createRequest<GetUserResponse, GetUserRequest>({
        url: getUserUrl,
      });

      export const updateUserUrl = '/api/user/update';
      export const updateUser = createRequest<UpdateUserResponse, UpdateUserRequest>({
        url: updateUserUrl,
        method: 'POST',
      });
    `;

    const result = parseApiFile(code, 'user');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      module: 'user',
      name: 'getUser',
      url: '/api/user/info',
      method: 'GET',
    });
    expect(result[1]).toMatchObject({
      module: 'user',
      name: 'updateUser',
      url: '/api/user/update',
      method: 'POST',
    });
  });

  it('handles inline URL strings', () => {
    const code = `
      export const getData = createRequest<DataResponse, DataRequest>({
        url: '/api/data',
        method: 'GET',
      });
    `;

    const result = parseApiFile(code, 'data');

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('/api/data');
  });

  it('handles multi-line object literals', () => {
    const code = `
      export const complexUrl = '/api/complex';
      export const complex = createRequest<
        ComplexResponse,
        ComplexRequest
      >({
        url: complexUrl,
        method: 'POST',
      });
    `;

    const result = parseApiFile(code, 'complex');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('complex');
  });

  it('returns empty array for invalid code', () => {
    const code = `
      const notAnExport = 'hello';
    `;

    const result = parseApiFile(code, 'test');

    expect(result).toHaveLength(0);
  });
});
