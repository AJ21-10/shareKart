import { buildErrorBody } from '../utils/errors.js';

/**
 * Validates request body against a specified rule set BEFORE touching any service.
 * If ANY field fails validation, it aggregates EVERY bad field and immediately returns
 * HTTP 422 Unprocessable Entity with all errors in a single canonical response.
 *
 * @param {Record<string, FieldRule>} rules
 * @returns {import('express').RequestHandler}
 */
export function validateBody(rules) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const val = body[field];
      const isMissing = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');

      // Check required
      if (rule.required && isMissing) {
        errors.push({
          field,
          message: rule.requiredMessage || rule.message || `${field} is required`
        });
        continue;
      }

      // If not required and missing/empty, skip further checks
      if (isMissing) {
        continue;
      }

      // Type checks
      if (rule.type) {
        if (rule.type === 'number') {
          const num = Number(val);
          if (isNaN(num)) {
            errors.push({
              field,
              message: rule.typeMessage || `${field} must be a valid number`
            });
            continue;
          }
        } else if (rule.type === 'string') {
          if (typeof val !== 'string') {
            errors.push({
              field,
              message: rule.typeMessage || `${field} must be a string`
            });
            continue;
          }
        } else if (rule.type === 'array') {
          if (!Array.isArray(val)) {
            errors.push({
              field,
              message: rule.typeMessage || `${field} must be an array`
            });
            continue;
          }
        } else if (rule.type === 'boolean') {
          if (typeof val !== 'boolean') {
            errors.push({
              field,
              message: rule.typeMessage || `${field} must be a boolean`
            });
            continue;
          }
        }
      }

      // Min value / length
      if (rule.min !== undefined) {
        if (typeof val === 'number' || (rule.type === 'number' && !isNaN(Number(val)))) {
          if (Number(val) < rule.min) {
            errors.push({
              field,
              message: rule.minMessage || `${field} must be at least ${rule.min}`
            });
            continue;
          }
        } else if (typeof val === 'string' && val.length < rule.min) {
          errors.push({
            field,
            message: rule.minMessage || `${field} must be at least ${rule.min} characters`
          });
          continue;
        } else if (Array.isArray(val) && val.length < rule.min) {
          errors.push({
            field,
            message: rule.minMessage || `${field} must contain at least ${rule.min} items`
          });
          continue;
        }
      }

      // Max value / length
      if (rule.max !== undefined) {
        if (typeof val === 'number' || (rule.type === 'number' && !isNaN(Number(val)))) {
          if (Number(val) > rule.max) {
            errors.push({
              field,
              message: rule.maxMessage || `${field} cannot exceed ${rule.max}`
            });
            continue;
          }
        } else if (typeof val === 'string' && val.length > rule.max) {
          errors.push({
            field,
            message: rule.maxMessage || `${field} cannot exceed ${rule.max} characters`
          });
          continue;
        }
      }

      // Enum check
      if (rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum.includes(val)) {
          errors.push({
            field,
            message: rule.enumMessage || `${field} must be one of: ${rule.enum.join(', ')}`
          });
          continue;
        }
      }

      // Regex pattern check
      if (rule.pattern instanceof RegExp) {
        if (!rule.pattern.test(String(val))) {
          errors.push({
            field,
            message: rule.patternMessage || rule.message || `${field} format is invalid`
          });
          continue;
        }
      }

      // Custom validation function
      if (typeof rule.validate === 'function') {
        const customResult = rule.validate(val, body);
        if (customResult !== true) {
          errors.push({
            field,
            message: typeof customResult === 'string' ? customResult : (rule.message || `${field} is invalid`)
          });
          continue;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(422).json(buildErrorBody({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${errors.length} field(s) have errors.`,
        errors
      }));
    }

    next();
  };
}
