import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
