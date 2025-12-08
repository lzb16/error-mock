// packages/core/src/__tests__/response.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSuccessResponse, generateBusinessErrorResponse } from '../engine/response';

describe('generateSuccessResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates response with custom result', () => {
    const result = { id: 1, name: 'test' };
    const response = generateSuccessResponse(result);

    expect(response.err_no).toBe(0);
    expect(response.err_msg).toBe('');
    expect(response.detail_err_msg).toBe('');
    expect(response.result).toEqual(result);
    expect(response.sync).toBe(true);
    expect(response.time_stamp).toBe(1735689600000);
    expect(response.time_zone_ID).toBe('Asia/Shanghai');
    expect(response.time_zone_offset).toBe(-480);
    expect(typeof response.trace_id).toBe('string');
    expect(response.trace_id).toMatch(/^\[[\da-f]+\]$/);
  });

  it('generates response with null result', () => {
    const response = generateSuccessResponse(null);
    expect(response.result).toBeNull();
  });

  it('generates response with array result', () => {
    const result = [{ id: 1 }, { id: 2 }];
    const response = generateSuccessResponse(result);
    expect(response.result).toEqual(result);
  });
});

describe('generateBusinessErrorResponse', () => {
  it('generates response with business error', () => {
    const response = generateBusinessErrorResponse({
      errNo: 10001,
      errMsg: 'Token expired',
      detailErrMsg: 'Please login again',
    });

    expect(response.err_no).toBe(10001);
    expect(response.err_msg).toBe('Token expired');
    expect(response.detail_err_msg).toBe('Please login again');
    expect(response.result).toBeNull();
    expect(response.sync).toBe(true);
  });

  it('generates response with empty error message', () => {
    const response = generateBusinessErrorResponse({
      errNo: 500,
      errMsg: '',
      detailErrMsg: '',
    });

    expect(response.err_no).toBe(500);
    expect(response.err_msg).toBe('');
  });
});
