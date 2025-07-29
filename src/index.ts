import axios, { AxiosResponse, AxiosError, CancelTokenSource } from 'axios';
import { call, cancelled } from 'redux-saga/effects';

export interface ServiceWrapperSagaOptions {
  handleError?: Map<number, () => void>;
  timeout?: number;
}

export interface ServiceResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

// Helper function to call service with axios config
function callServiceWithConfig<T extends Array<any>, R>(
  fn: (...args: T) => Promise<AxiosResponse<R>>,
  axiosConfig: any,
  ...args: T
): Promise<AxiosResponse<R>> {
  // Extract the last argument if it's an axios config and merge it
  const lastArg = args[args.length - 1];
  const isLastArgAxiosConfig = lastArg && typeof lastArg === 'object' && 
    ('url' in lastArg || 'method' in lastArg || 'data' in lastArg || 'params' in lastArg);
  
  if (isLastArgAxiosConfig) {
    // If last argument is axios config, merge with our config
    const mergedConfig = { ...lastArg, ...axiosConfig };
    const newArgs = [...args.slice(0, -1), mergedConfig] as T;
    return fn(...newArgs);
  } else {
    // Add our config as the last argument
    const newArgs = [...args, axiosConfig] as T;
    return fn(...newArgs);
  }
}

export function* serviceWrapperSaga<T extends Array<any>, R = any>(
  fn: (...args: T) => Promise<AxiosResponse<R>>,
  options: ServiceWrapperSagaOptions = {},
  ...args: T
): Generator<any, AxiosResponse<R> | undefined, any> {
  const { handleError, timeout = 30000 } = options;
  const CancelToken = axios.CancelToken;
  const source: CancelTokenSource = CancelToken.source();
  
  try {
    // Create axios config object
    const axiosConfig = { 
      cancelToken: source.token,
      timeout 
    };
    
    // Call service function with proper config merging
    const response: AxiosResponse<R> = yield call(
      callServiceWithConfig,
      fn,
      axiosConfig,
      ...args
    );
    return response;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log('Request was cancelled');
      return undefined;
    }
    
    // Type guard for axios error
    const isAxiosError = (err: any): err is AxiosError => {
      return err && err.isAxiosError === true;
    };
    
    if (isAxiosError(error)) {
      if (error.response) {
        const response = error.response;
        console.error(`Service error: ${response.status} - ${response.statusText}`, response.data);
        
        // Handle specific error status codes
        if (handleError && handleError.has(response.status)) {
          const errorHandler = handleError.get(response.status);
          if (errorHandler) {
            errorHandler();
          }
        }
      } else if (error.request) {
        console.error('Network error - no response received:', error.message);
      } else {
        console.error('Service setup error:', error.message || 'Unknown error');
      }
    } else {
      console.error('Unknown error occurred:', error);
    }
    
    // Re-throw error for saga error handling
    throw error;
  } finally {
    if (yield cancelled()) {
      source.cancel('Operation cancelled by user');
      console.log('Service call cancelled');
    }
  }
}
