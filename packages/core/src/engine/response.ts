// packages/core/src/engine/response.ts
import type { ApiResponse } from '../types';

// Legacy BusinessConfig for backward compatibility
interface BusinessConfig {
  errNo: number;
  errMsg: string;
  detailErrMsg: string;
}

function generateTraceId(): string {
  const hex = Math.random().toString(16).slice(2, 12).padStart(10, '0');
  return `[${hex}]`;
}

function createBaseResponse<T>(result: T): ApiResponse<T> {
  return {
    err_no: 0,
    err_msg: '',
    detail_err_msg: '',
    result,
    sync: true,
    time_stamp: Date.now(),
    time_zone_ID: 'Asia/Shanghai',
    time_zone_offset: -480,
    trace_id: generateTraceId(),
  };
}

export function generateSuccessResponse<T>(result: T): ApiResponse<T> {
  return createBaseResponse(result);
}

export function generateBusinessErrorResponse(
  config: BusinessConfig
): ApiResponse<null> {
  return {
    ...createBaseResponse(null),
    err_no: config.errNo,
    err_msg: config.errMsg,
    detail_err_msg: config.detailErrMsg,
  };
}
