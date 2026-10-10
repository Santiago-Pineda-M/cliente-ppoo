// Único lugar con fetch. Adjunta auth, refresca con cola single-flight y emite trazas.
// No importa Application ni Controllers: todo se inyecta vía setters desde DI.

import type { ApiErrorType, ResultType } from '@/Domain';
import type { HttpTraceInputType, TraceSinkType } from '@/Domain/States/http-trace.states';

export type ApiRequestOptionsType = {
  // false = ruta pública (login/refresh/bootstrap/consultas): sin headers auth ni refresh ante 401.
  auth?: boolean;
  // Headers explícitos (ej: login usa el par recién obtenido sin pasar por el store).
  // Tienen prioridad sobre el provider de auth.
  headers?: Record<string, string>;
};

export type AuthHeaderProviderType = () => { access: string | null; apiKey: string | null };

// true = sesión renovada, reintentar la petición una vez.
export type UnauthorizedHandlerType = () => Promise<boolean>;

const MAX_BODY_CHARS = 8192;
const MASKED = '•••';
const SENSITIVE_HEADERS = new Set(['authorization', 'x-api-key']);

function truncate(value: unknown): unknown {
  if (typeof value === 'string' && value.length > MAX_BODY_CHARS) {
    return `${value.slice(0, MAX_BODY_CHARS)}…[truncado ${value.length - MAX_BODY_CHARS} chars]`;
  }
  return value;
}

function parseBody(init?: RequestInit): unknown {
  if (!init?.body || typeof init.body !== 'string') return init?.body ?? null;
  try {
    return JSON.parse(init.body) as unknown;
  } catch {
    return init.body;
  }
}

// Copia los headers enviados, enmascarando credenciales (defensa en profundidad;
// el servicio de trazas vuelve a enmascarar bodies).
function snapshotHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? MASKED : value;
  });
  return out;
}

// La API responde errores como application/problem+json:
// { status, code, message, errors, traceId }.
function problemMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null) {
    const record = payload as Record<string, unknown>;
    const message = record.message;
    const code = record.code;
    if (typeof message === 'string' && message.trim()) {
      return typeof code === 'string' && code.trim() ? `${message} [${code}]` : message;
    }
  }
  return fallback;
}

export class ApiClient {
  private authHeaderProvider: AuthHeaderProviderType | null = null;
  private unauthorizedHandler: UnauthorizedHandlerType | null = null;
  private traceSink: TraceSinkType | null = null;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(private readonly baseUrl: string) {}

  setAuthHeaderProvider(p: AuthHeaderProviderType | null): void {
    this.authHeaderProvider = p;
  }

  setUnauthorizedHandler(h: UnauthorizedHandlerType | null): void {
    this.unauthorizedHandler = h;
  }

  setTraceSink(s: TraceSinkType | null): void {
    this.traceSink = s;
  }

  // Varias 401 concurrentes comparten el mismo refresh.
  private runUnauthorized(): Promise<boolean> {
    if (!this.refreshInFlight) {
      const run = async (): Promise<boolean> => {
        try {
          return this.unauthorizedHandler ? await this.unauthorizedHandler() : false;
        } finally {
          this.refreshInFlight = null;
        }
      };
      this.refreshInFlight = run();
    }
    return this.refreshInFlight;
  }

  private emit(trace: HttpTraceInputType): void {
    try {
      this.traceSink?.(trace);
    } catch {
      // Las trazas nunca rompen la petición.
    }
  }

  async request<T>(path: string, init?: RequestInit, opts?: ApiRequestOptionsType): Promise<ResultType<T>> {
    const withAuth = opts?.auth !== false;
    const url = `${this.baseUrl}${path}`;
    const method = init?.method ?? 'GET';
    const reqBody = truncate(parseBody(init));
    const started = performance.now();
    const at = new Date().toISOString();

    const send = async (): Promise<{ res: Response; sentHeaders: Record<string, string> }> => {
      const headers = new Headers(init?.headers);
      if (opts?.headers) {
        for (const [key, value] of Object.entries(opts.headers)) headers.set(key, value);
      }
      headers.set('Content-Type', 'application/json');
      if (withAuth && !headers.has('Authorization')) {
        const access = this.authHeaderProvider?.()?.access;
        if (access) headers.set('Authorization', `Bearer ${access}`);
      }
      if (withAuth && !headers.has('X-API-Key')) {
        const apiKey = this.authHeaderProvider?.()?.apiKey;
        if (apiKey) headers.set('X-API-Key', apiKey);
      }
      const res = await fetch(url, { ...init, headers });
      return { res, sentHeaders: snapshotHeaders(headers) };
    };

    const traceBase = { method, url, reqBody, at };

    // Lee el cuerpo una sola vez: sirve para el dato (2xx) y para el
    // mensaje problem+json (4xx/5xx). 204 NoContent no trae cuerpo.
    const read = async (
      sent: { res: Response; sentHeaders: Record<string, string> },
    ): Promise<ResultType<T>> => {
      const { res, sentHeaders } = sent;
      if (res.status === 204) {
        this.emit({ ...traceBase, reqHeaders: sentHeaders, status: 204, resBody: null, ms: performance.now() - started, ok: true });
        return { ok: true, value: undefined as T };
      }
      let payload: unknown = null;
      try {
        payload = (await res.json()) as unknown;
      } catch {
        payload = null;
      }
      if (res.status === 401 || res.status === 403) {
        this.emit({ ...traceBase, reqHeaders: sentHeaders, status: res.status, resBody: truncate(payload), ms: performance.now() - started, ok: false });
        return { ok: false, error: { kind: 'auth', status: res.status, message: problemMessage(payload, 'No autorizado') } };
      }
      if (!res.ok) {
        this.emit({ ...traceBase, reqHeaders: sentHeaders, status: res.status, resBody: truncate(payload), ms: performance.now() - started, ok: false });
        return { ok: false, error: { kind: 'http', status: res.status, message: problemMessage(payload, `Error HTTP ${res.status}`) } };
      }
      if (payload === null) {
        this.emit({ ...traceBase, reqHeaders: sentHeaders, status: res.status, resBody: null, ms: performance.now() - started, ok: false });
        return { ok: false, error: { kind: 'parse', message: 'Respuesta vacía o inválida' } };
      }
      this.emit({
        ...traceBase,
        reqHeaders: sentHeaders,
        status: res.status,
        resBody: truncate(payload),
        ms: performance.now() - started,
        ok: true,
      });
      return { ok: true, value: payload as T };
    };

    let sent: { res: Response; sentHeaders: Record<string, string> };
    try {
      sent = await send();
    } catch {
      this.emit({ ...traceBase, reqHeaders: {}, resBody: null, ms: performance.now() - started, ok: false });
      return { ok: false, error: { kind: 'network', message: 'Error de red' } satisfies ApiErrorType };
    }

    // 401 con sesión: un refresh compartido y un solo reintento.
    if (sent.res.status === 401 && withAuth && this.unauthorizedHandler) {
      const renewed = await this.runUnauthorized();
      if (renewed) {
        try {
          sent = await send();
        } catch {
          this.emit({ ...traceBase, reqHeaders: {}, resBody: null, ms: performance.now() - started, ok: false });
          return { ok: false, error: { kind: 'network', message: 'Error de red' } satisfies ApiErrorType };
        }
      } else {
        this.emit({ ...traceBase, reqHeaders: sent.sentHeaders, status: 401, resBody: null, ms: performance.now() - started, ok: false });
        return { ok: false, error: { kind: 'auth', status: 401, message: 'Sesión expirada' } };
      }
    }

    return read(sent);
  }

  get<T>(path: string, opts?: ApiRequestOptionsType): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'GET' }, opts);
  }

  post<T>(path: string, body: unknown, opts?: ApiRequestOptionsType): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) }, opts);
  }

  put<T>(path: string, body: unknown, opts?: ApiRequestOptionsType): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, opts);
  }

  patch<T>(path: string, body: unknown, opts?: ApiRequestOptionsType): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, opts);
  }

  del<T>(path: string, opts?: ApiRequestOptionsType): Promise<ResultType<T>> {
    return this.request<T>(path, { method: 'DELETE' }, opts);
  }
}
