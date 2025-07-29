# Redux Saga Service Wrapper

A streamlined TypeScript wrapper for managing Redux Saga service calls with enhanced error handling, automatic cancellation support, and type safety.

[![npm version](https://badge.fury.io/js/redux-saga-service-wrapper.svg)](https://badge.fury.io/js/redux-saga-service-wrapper)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

- **Single Saga Management**: Handle all service calls with one reusable saga
- **Type Safety**: Full TypeScript support with generic types  
- **Error Handling**: Centralized error management with status code mapping
- **Automatic Cancellation**: Built-in Axios cancel token support
- **Timeout Support**: Configurable request timeouts
- **Modern**: Uses latest Axios and Redux Saga versions

## 📦 Installation

```bash
npm install redux-saga-service-wrapper
# or
yarn add redux-saga-service-wrapper
```

## 🛠️ Usage

### Basic Service Setup

```typescript
import axios from 'axios';

export const endpoints = {
  users: () => `/api/users`,
  posts: (id: string) => `/api/posts/${id}`
};

export const getUsers = (): Promise<AxiosResponse<User[]>> => 
  axios.get(endpoints.users());

export const getPost = (id: string): Promise<AxiosResponse<Post>> => 
  axios.get(endpoints.posts(id));

export const createPost = (data: CreatePostRequest): Promise<AxiosResponse<Post>> => 
  axios.post(endpoints.posts(''), data);
```

### GET Service Call

```typescript
import { serviceWrapperSaga } from 'redux-saga-service-wrapper';

function* getUsersSaga() {
  try {
    const response = yield serviceWrapperSaga(getUsers);
    const users = response.data;
    // Handle successful response
    yield put(setUsers(users));
  } catch (error) {
    // Handle error
    yield put(setError(error.message));
  }
}
```

### POST Service Call with Options

```typescript
function* createPostSaga(action: CreatePostAction) {
  try {
    const response = yield serviceWrapperSaga(
      createPost,
      {
        timeout: 10000, // 10 second timeout
        handleError: new Map([
          [400, () => console.log('Bad Request')],
          [401, () => console.log('Unauthorized')],
          [500, () => console.log('Server Error')]
        ])
      },
      action.payload
    );
    
    yield put(postCreated(response.data));
  } catch (error) {
    yield put(createPostFailed(error.message));
  }
}
```

## 🔧 API Reference

### `serviceWrapperSaga<T, R>(fn, options?, ...args)`

#### Parameters

- **`fn`**: `(...args: T) => Promise<AxiosResponse<R>>` - The service function to call
- **`options`**: `ServiceWrapperSagaOptions` - Optional configuration object
- **`...args`**: `T` - Arguments to pass to the service function

#### Options

```typescript
interface ServiceWrapperSagaOptions {
  handleError?: Map<number, () => void>; // Status code error handlers
  timeout?: number;                      // Request timeout in milliseconds (default: 30000)
}
```

#### Returns

- **Success**: `AxiosResponse<R>` - The complete Axios response
- **Cancellation**: `undefined` - When request is cancelled
- **Error**: Throws the original error for saga error handling

## 🛡️ Error Handling

The wrapper provides comprehensive error handling:

### Automatic Error Logging

```typescript
// Network errors
console.error('Network error - no response received:', error.message);

// Server errors  
console.error(`Service error: ${status} - ${statusText}`, responseData);

// Setup errors
console.error('Service setup error:', error.message);
```

### Custom Error Handlers

```typescript
const errorHandlers = new Map([
  [400, () => showToast('Invalid request')],
  [401, () => redirectToLogin()],
  [403, () => showAccessDenied()],
  [404, () => showNotFound()],
  [500, () => showServerError()]
]);

function* myServiceSaga() {
  try {
    const response = yield serviceWrapperSaga(
      myService, 
      { handleError: errorHandlers }
    );
  } catch (error) {
    // Additional error handling if needed
  }
}
```

## ⚡ Advanced Features

### Request Cancellation

Automatic cancellation support when saga is cancelled:

```typescript
function* cancellableServiceSaga() {
  try {
    // This will be cancelled if the saga is cancelled
    const response = yield serviceWrapperSaga(longRunningService);
  } finally {
    if (yield cancelled()) {
      console.log('Service call was cancelled');
    }
  }
}
```

### Type Safety

Full TypeScript support with generic types:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function* typedServiceSaga() {
  // Response is typed as AxiosResponse<User[]>
  const response = yield serviceWrapperSaga<[], User[]>(getUsers);
  const users: User[] = response.data; // Fully typed
}
```

## 🔄 Migration from v1.0.6

If upgrading from previous versions:

1. **Function signature changed**: `handleError` is now part of options object
2. **Better typing**: Add type parameters for better IntelliSense
3. **New timeout option**: Configure per-request timeouts

```typescript
// Old (v1.0.6)
yield serviceWrapperSaga(myService, errorHandlers, ...args);

// New (v1.0.7+)
yield serviceWrapperSaga(myService, { handleError: errorHandlers }, ...args);
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [GitHub Repository](https://github.com/kaankucukx/redux-saga-service-wrapper)
- [npm Package](https://www.npmjs.com/package/redux-saga-service-wrapper)
- [Issues](https://github.com/kaankucukx/redux-saga-service-wrapper/issues)
