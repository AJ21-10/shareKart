import { buildErrorBody } from '../utils/errors.js';

/**
 * Middleware that decorates `res` with a standard `res.sendError()` method.
 * Guarantees no endpoint can invent an arbitrary error payload format.
 */
export const errorResponseMiddleware = (req, res, next) => {
  res.sendError = (status, message, errors = null, code = null) => {
    const errorBody = buildErrorBody({ status, message, errors, code });
    return res.status(status).json(errorBody);
  };
  next();
};

/**
 * Centralized unhandled error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || null;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : undefined);

  const errorBody = buildErrorBody({
    status,
    message,
    errors,
    code,
  });

  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorBody.stack = err.stack;
  }

  res.status(status).json(errorBody);
};
