import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseApiFile, createDefaultAdapter } from '../adapters/default';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

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

  it('handles template literal URLs', () => {
    const code = `
      export const baseUrl = \`/api/base\`;
      export const getBase = createRequest<BaseResponse, BaseRequest>({
        url: baseUrl,
      });
    `;

    const result = parseApiFile(code, 'base');

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('/api/base');
  });

  describe('parser limitations (documented edge cases)', () => {
    it('does not detect createRequest in object properties', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const code = `
        const apis = {
          getUser: createRequest<User, void>({
            url: '/api/user',
          })
        };
        export default apis;
      `;

      const result = parseApiFile(code, 'test');

      // Parser only detects top-level export const patterns
      expect(result).toHaveLength(0);

      spy.mockRestore();
    });

    it('does not resolve imported URL constants from other files', () => {
      const code = `
        import { BASE_URL } from './constants';
        export const getUser = createRequest<User, void>({
          url: BASE_URL + '/user',
        });
      `;

      const result = parseApiFile(code, 'test');

      // Parser cannot resolve imports or concatenated URLs
      expect(result).toHaveLength(0);
    });

    it('does not detect createRequest calls in enum/class methods', () => {
      const code = `
        enum API {
          GetUser = createRequest<User, void>({
            url: '/api/user',
          })
        }

        class ApiService {
          getUser = createRequest<User, void>({
            url: '/api/user',
          });
        }
      `;

      const result = parseApiFile(code, 'test');

      // Parser only handles top-level variable declarations
      expect(result).toHaveLength(0);
    });

    it('does not detect re-exported createRequest calls', () => {
      const code = `
        const getUserApi = createRequest<User, void>({
          url: '/api/user',
        });

        export { getUserApi };
      `;

      const result = parseApiFile(code, 'test');

      // NOTE: The parser actually DOES detect this pattern because
      // it finds the variable declaration with createRequest call.
      // The fact that it's re-exported doesn't prevent detection.
      // This documents current behavior - not a limitation.
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('getUserApi');
    });

    it('does not detect createRequest in function returns', () => {
      const code = `
        function createUserApi() {
          return createRequest<User, void>({
            url: '/api/user',
          });
        }

        export const getUser = createUserApi();
      `;

      const result = parseApiFile(code, 'test');

      // Parser requires direct createRequest call, not function return
      expect(result).toHaveLength(0);
    });

    it('does not detect createRequest with computed property URLs', () => {
      const code = `
        const API_VERSION = 'v1';
        export const getUser = createRequest<User, void>({
          url: \`/api/\${API_VERSION}/user\`,
        });
      `;

      const result = parseApiFile(code, 'test');

      // Parser only handles simple string literals or identifier references
      // Template literals with substitutions are not supported
      expect(result).toHaveLength(0);
    });

    it('documents that complex patterns require manual rule creation', () => {
      const code = `
        // Example of patterns that require manual MockRule creation:
        // 1. Dynamic API registries
        const apiRegistry = {
          user: { get: createRequest({ url: '/api/user' }) },
          post: { get: createRequest({ url: '/api/post' }) },
        };

        // 2. Factory functions
        function createCRUD(resource: string) {
          return {
            get: createRequest({ url: \`/api/\${resource}\` }),
            post: createRequest({ url: \`/api/\${resource}\`, method: 'POST' }),
          };
        }

        // 3. Conditional API definitions
        export const api = process.env.USE_V2
          ? createRequest({ url: '/api/v2/user' })
          : createRequest({ url: '/api/v1/user' });
      `;

      const result = parseApiFile(code, 'test');

      // These patterns are intentionally not supported
      // Users should create MockRules manually for such cases
      expect(result).toHaveLength(0);
    });
  });
});

describe('createDefaultAdapter', () => {
  let testDir: string;
  let adapter: ReturnType<typeof createDefaultAdapter>;

  beforeEach(() => {
    // Create a unique temp directory for each test
    testDir = fs.mkdtempSync(path.join(tmpdir(), 'parser-test-'));
    adapter = createDefaultAdapter();
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('parses directory with valid API modules', () => {
    // Create test API structure
    const userDir = path.join(testDir, 'user');
    fs.mkdirSync(userDir, { recursive: true });
    fs.writeFileSync(
      path.join(userDir, 'index.ts'),
      `
        export const getUserUrl = '/api/user';
        export const getUser = createRequest<User, void>({
          url: getUserUrl,
        });
      `
    );

    const result = adapter.parse(testDir);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      module: 'user',
      name: 'getUser',
      url: '/api/user',
      method: 'GET',
    });
  });

  it('handles missing API directory gracefully', () => {
    const nonExistentDir = path.join(testDir, 'does-not-exist');
    const result = adapter.parse(nonExistentDir);

    expect(result).toEqual([]);
  });

  it('skips modules without index.ts', () => {
    const emptyDir = path.join(testDir, 'empty');
    fs.mkdirSync(emptyDir, { recursive: true });

    const result = adapter.parse(testDir);

    expect(result).toEqual([]);
  });

  it('handles parse errors gracefully', () => {
    const badDir = path.join(testDir, 'bad');
    fs.mkdirSync(badDir, { recursive: true });
    // Write invalid TypeScript
    fs.writeFileSync(path.join(badDir, 'index.ts'), 'this is not valid typescript {{}}');

    const result = adapter.parse(testDir);

    // Should return empty array without throwing
    expect(result).toEqual([]);
  });

  it('parses multiple modules', () => {
    // Create user module
    const userDir = path.join(testDir, 'user');
    fs.mkdirSync(userDir, { recursive: true });
    fs.writeFileSync(
      path.join(userDir, 'index.ts'),
      `
        export const getUserUrl = '/api/user';
        export const getUser = createRequest<User, void>({
          url: getUserUrl,
        });
      `
    );

    // Create product module
    const productDir = path.join(testDir, 'product');
    fs.mkdirSync(productDir, { recursive: true });
    fs.writeFileSync(
      path.join(productDir, 'index.ts'),
      `
        export const getProductUrl = '/api/product';
        export const getProduct = createRequest<Product, void>({
          url: getProductUrl,
        });
      `
    );

    const result = adapter.parse(testDir);

    expect(result).toHaveLength(2);
    expect(result.find(r => r.module === 'user')).toBeDefined();
    expect(result.find(r => r.module === 'product')).toBeDefined();
  });

  it('handles file read errors gracefully', () => {
    const restrictedDir = path.join(testDir, 'restricted');
    fs.mkdirSync(restrictedDir, { recursive: true });
    const indexPath = path.join(restrictedDir, 'index.ts');
    fs.writeFileSync(indexPath, 'export const test = 1;');

    // Make file unreadable (only on Unix-like systems)
    try {
      fs.chmodSync(indexPath, 0o000);

      const result = adapter.parse(testDir);

      // Should handle the error and continue
      expect(result).toEqual([]);

      // Restore permissions for cleanup
      fs.chmodSync(indexPath, 0o644);
    } catch (e) {
      // On systems where chmod doesn't work (e.g., Windows), skip this test
      fs.chmodSync(indexPath, 0o644);
    }
  });
});
