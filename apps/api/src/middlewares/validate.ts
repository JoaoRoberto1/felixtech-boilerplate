import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/errors.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

function flattenIssues(error: import('zod').ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    details[key] = [...(details[key] ?? []), issue.message];
  }
  return details;
}

/** Parses and replaces req.body/query/params with the validated (and coerced) data. */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (err) {
      if (err && typeof err === 'object' && 'issues' in err) {
        next(
          AppError.badRequest('Validation failed', flattenIssues(err as import('zod').ZodError)),
        );
        return;
      }
      next(err);
    }
  };
}
