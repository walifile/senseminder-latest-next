export async function fetchWithUserId<T = unknown>(
  url: string,
  {
    method = "GET",
    body,
    headers,
    userId,
  }: {
    method?: string;
    body?: T;
    headers?: HeadersInit;
    userId: string;
  }
) {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
