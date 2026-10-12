/**
 * Centralized Error Body Builder
 * 
 * Enforces a single canonical error shape across all endpoints in the application.
 * No controller, middleware, or service can invent its own error response format.
 */

/**
 * Builds the canonical error response object.
 *
 * @param {Object} options
 * @param {number} options.status - HTTP status code (400, 401, 403, 404, 409, 422, 500, etc.)
 * @param {string} options.message - Human-readable error summary
 * @param {Array<{field?: string, message: string}>} [options.errors] - Field-level validation or itemized errors
 * @param {string} [options.code] - Standardized application error code (e.g., 'VALIDATION_ERROR')
 * @returns {Object} Canonical JSON error body
 */
export function buildErrorBody({ status, message, errors = null, code = null }) {
  const errorBody = {
    success: false,
    status: Number(status) || 500,
    message: message || 'An error occurred processing your request',
  };

  if (code) {
    errorBody.code = code;
  }

  if (Array.isArray(errors) && errors.length > 0) {
    errorBody.errors = errors;
  }

  return errorBody;
}

/**
 * Base HTTP Application Error
 */
export class HttpError extends Error {
  constructor(status, message, errors = null, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends HttpError {
  constructor(errors, message = 'Validation failed') {
    super(422, message, Array.isArray(errors) ? errors : [errors], 'VALIDATION_ERROR');
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', errors = null) {
    super(400, message, errors, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Authentication required') {
    super(401, message, null, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Access forbidden') {
    super(403, message, null, 'FORBIDDEN');
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message, null, 'NOT_FOUND');
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Resource conflict') {
    super(409, message, null, 'CONFLICT');
  }
}
