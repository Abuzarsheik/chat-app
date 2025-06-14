import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errorType = error.name || 'Error';

  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = handleValidationError(error);
    errorType = 'ValidationError';
  } else if (error instanceof MongooseError.CastError) {
    statusCode = 400;
    message = handleCastError(error);
    errorType = 'CastError';
  } else if (error.code === 11000) {
    statusCode = 400;
    message = handleDuplicateError(error);
    errorType = 'DuplicateError';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorType = 'JsonWebTokenError';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    errorType = 'TokenExpiredError';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = handleMulterError(error);
    errorType = 'MulterError';
  }

  // Send error response
  const errorResponse = {
    success: false,
    message,
    error: errorType,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (error: MongooseError.ValidationError): string => {
  const errors = Object.values(error.errors).map(err => err.message);
  return `Validation failed: ${errors.join(', ')}`;
};

/**
 * Handle Mongoose cast errors
 */
const handleCastError = (error: MongooseError.CastError): string => {
  return `Invalid ${error.path}: ${error.value}`;
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateError = (error: any): string => {
  if (!error.keyValue) {
    return 'Duplicate key error';
  }
  
  const field = Object.keys(error.keyValue)[0];
  if (!field) {
    return 'Duplicate key error';
  }
  
  const value = error.keyValue[field];
  return `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
};

/**
 * Handle Multer errors (file upload)
 */
const handleMulterError = (error: any): string => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return 'File too large';
    case 'LIMIT_FILE_COUNT':
      return 'Too many files';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Unexpected file field';
    default:
      return 'File upload error';
  }
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async error wrapper for controllers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create standard API responses
 */
export const createResponse = {
  success: <T>(data: T, message = 'Success', statusCode = 200) => ({
    success: true,
    message,
    data,
    statusCode
  }),

  error: (message: string, statusCode = 500, error = 'ERROR') => ({
    success: false,
    message,
    error,
    statusCode
  }),

  validationError: (errors: any[], message = 'Validation failed') => ({
    success: false,
    message,
    errors,
    error: 'VALIDATION_ERROR',
    statusCode: 400
  })
};

/**
 * Send standardized responses
 */
export const sendResponse = {
  success: <T>(res: Response, data: T, message = 'Success', statusCode = 200): void => {
    res.status(statusCode).json(createResponse.success(data, message, statusCode));
  },

  error: (res: Response, message: string, statusCode = 500, error = 'ERROR'): void => {
    res.status(statusCode).json(createResponse.error(message, statusCode, error));
  },

  validationError: (res: Response, errors: any[], message = 'Validation failed'): void => {
    res.status(400).json(createResponse.validationError(errors, message));
  }
}; 