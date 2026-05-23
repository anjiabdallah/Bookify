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
    const error = await res.json().catch(() => ({ error: 'Something went wrong' }));
    throw new Error((error as { error?: string }).error || 'Something went wrong');
  }

  return res.json() as Promise<T>;
}
