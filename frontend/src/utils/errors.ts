// Utility type for consistent error context structure
type ErrorContext = {
  context: string;
  code: string;
  details?: Record<string, unknown>;  // Safe place for additional error info
  timestamp: Date;
}

// Helper to safely check if something is an Error
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Base error class that all other errors will extend
abstract class BaseError extends Error {
  constructor(
    message: string,
    public readonly errorContext: ErrorContext
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorContext.timestamp = new Date();
  }

  // Method to create a safe log object
  toLog(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      context: this.errorContext.context,
      code: this.errorContext.code,
      details: this.errorContext.details,
      timestamp: this.errorContext.timestamp
    };
  }
}

// Database error codes
export enum DatabaseErrorCodes {
  Insert = "insert_error",
  Update = "update_error",
  Delete = "delete_error",
  Select = "select_error",
}

// Database specific error
export class DatabaseError extends BaseError {
  constructor(
    message: string,
    context: string,
    code: DatabaseErrorCodes,
    details?: Record<string, unknown>
  ) {
    super(message, {
      context,
      code: `DB_${code}`,
      details,
      timestamp: new Date()
    });
  }
}

// API error codes
export enum ApiErrorCodes {
  InvalidRequest = "invalid_request",
  Unauthorized = "unauthorized",
  NotFound = "not_found"
}

// API specific error
export class ApiError extends BaseError {
  constructor(
    message: string, 
    context: string,
    code: ApiErrorCodes,
    details?: Record<string, unknown>
  ) {
    super(message, {
      context,
      code: `API_${code}`,
      details,
      timestamp: new Date()
    });
  }
}
