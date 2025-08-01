export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRetryable: boolean = false,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, userMessage: string = 'Network connection error. Please check your internet connection.') {
    super(message, 'NETWORK_ERROR', true, userMessage);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string, userMessage?: string) {
    super(`${service} service unavailable`, 'SERVICE_UNAVAILABLE', true, 
      userMessage || `${service} is temporarily unavailable. Please try again later.`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'VALIDATION_ERROR', false, userMessage || 'Invalid input provided.');
  }
}

export class PermissionError extends AppError {
  constructor(permission: string, userMessage?: string) {
    super(`${permission} permission denied`, 'PERMISSION_ERROR', false,
      userMessage || `Please grant ${permission} permission to use this feature.`);
  }
}

export const handleError = (error: unknown, fallbackMessage: string = 'An unexpected error occurred') => {
  console.error('Error handled:', error);
  
  if (error instanceof AppError) {
    return {
      message: error.userMessage || error.message,
      isRetryable: error.isRetryable,
      code: error.code
    };
  }
  
  if (error instanceof Error) {
    return {
      message: fallbackMessage,
      isRetryable: false,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  return {
    message: fallbackMessage,
    isRetryable: false,
    code: 'UNKNOWN_ERROR'
  };
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof AppError && !error.isRetryable) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};