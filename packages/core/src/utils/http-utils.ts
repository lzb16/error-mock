// packages/core/src/utils/http-utils.ts

/**
 * Get HTTP status text for common status codes
 */
export function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}

/**
 * Generate trace ID for response
 */
export function generateTraceId(): string {
  const hex = Math.random().toString(16).slice(2, 12).padStart(10, '0');
  return `[${hex}]`;
}
