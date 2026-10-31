import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod Validation Errors (422 Unprocessable Entity as per API contract)
  if (err instanceof ZodError) {
    const errorMap: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'general';
      if (!errorMap[field]) {
        errorMap[field] = issue.message;
      }
    }

    res.status(422).json({
      message: 'Validation failed',
      errors: errorMap,
    });
    return;
  }

  // Handle Known AppError
  if (err instanceof AppError) {
    const response: { message: string; errors?: Record<string, string> } = {
      message: err.message,
    };
    if (err.details && typeof err.details === 'object') {
      response.errors = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Log unexpected internal errors
  console.error('💥 Unhandled Error:', err);

  res.status(500).json({
    message: 'An unexpected internal error occurred on the server',
  });
};
