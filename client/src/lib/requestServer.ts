type ServerErrorBody = {
  error?: unknown;
};

export async function requestServer<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`http://localhost:3001${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch<ServerErrorBody>(() => ({ error: 'Something went wrong' }));
    const errorValue = errorBody.error;
    const message = typeof errorValue === 'string'
      ? errorValue
      : errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string'
        ? errorValue.message
        : Array.isArray(errorValue)
          ? errorValue.join(', ')
          : JSON.stringify(errorValue);
    throw new Error(message || 'Something went wrong');
  }

  return res.json() as Promise<T>;
}
