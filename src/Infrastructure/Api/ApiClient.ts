import type { ApiErrorType, ResultType } from '@/Domain';

// Único lugar con fetch. Sin lógica de dominio: no construye entidades.
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenProvider?: () => string | null,
  ) {}

  async request<T>(path: string, init?: RequestInit): Promise<ResultType<T>> {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    const token = this.tokenProvider?.();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Error de red' } satisfies ApiErrorType };
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: { kind: 'auth', status: res.status, message: 'No autorizado' } };
      }
      return { ok: false, error: { kind: 'http', status: res.status, message: `Error HTTP ${res.status}` } };
    }

    try {
      const data = (await res.json()) as T;
      return { ok: true, value: data };
    } catch {
      return { ok: false, error: { kind: 'parse', message: 'Respuesta inválida' } };
    }
  }

  get<T>(path: string): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body: unknown): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(path: string, body: unknown): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch<T>(path: string, body: unknown): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  del<T>(path: string): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}
