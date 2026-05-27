type ServerErrorBody = {
  error?: unknown;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 15000;

export async function requestServer<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem('token');
  const isMultipartRequest = options?.body instanceof FormData;
  const controller = new AbortController();
  const timeout = isMultipartRequest
    ? null
    : setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    ...(isMultipartRequest ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const url = new URL(path, apiBaseUrl).toString();
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      signal: options?.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please try again.');
      (timeoutError as Error & { cause?: unknown }).cause = error;
      throw timeoutError;
    }
    if (error instanceof Error) {
      (error as Error & { cause?: unknown }).cause = error;
    }
    throw error;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';
    let errorMessage = 'Something went wrong';
    let cause: unknown;

    if (contentType.includes('application/json')) {
      const errorBody = await res.json().catch<ServerErrorBody>(() => ({ error: errorMessage }));
      cause = errorBody;
      const errorValue = errorBody.error;
      if (typeof errorValue === 'string') {
        errorMessage = errorValue;
      } else if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string') {
        errorMessage = errorValue.message;
      } else if (Array.isArray(errorValue)) {
        errorMessage = errorValue.join(', ');
      } else {
        errorMessage = JSON.stringify(errorValue);
      }
    } else {
      const text = await res.text().catch(() => 'Something went wrong');
      cause = text;
      if (text) {
        errorMessage = text;
      }
    }

    const error = new Error(errorMessage || 'Something went wrong', { cause });
    (error as Error & { cause?: unknown }).cause = cause;
    throw error;
  }

  return res.json() as Promise<T>;
}
