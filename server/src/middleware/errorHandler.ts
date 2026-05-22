import type { ErrorRequestHandler } from 'express';

const STATUS_TO_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'REQUEST_TOO_LARGE',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMITED',
  502: 'UPSTREAM_ERROR',
  503: 'UPSTREAM_UNAVAILABLE',
  504: 'UPSTREAM_TIMEOUT',
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const maybeStatus = (err as { status?: unknown } | null)?.status;
  const status =
    typeof maybeStatus === 'number' && maybeStatus >= 400 && maybeStatus < 600
      ? maybeStatus
      : 500;

  const code = STATUS_TO_CODE[status] ?? 'INTERNAL_ERROR';
  const message = err instanceof Error ? err.message : 'unknown error';

  console.error('[errorHandler]', { status, code, message });

  res.status(status).json({
    error: { code, message },
  });
};
