// Acumulador en memoria de trazas HTTP (ring buffer).
// Enmascara credenciales y secretos antes de guardar: el drawer nunca ve tokens.

import type { HttpTraceInputType, HttpTraceType } from '@/Domain/States/http-trace.states';
import type { IHttpTraceService } from '@/Application/Services/IHttpTraceService';

const MAX_TRACES = 100;
const MASKED = '•••';
const SENSITIVE_KEYS = new Set([
  'authorization',
  'x-api-key',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'password',
  'token',
]);

function maskValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) return MASKED;
  return mask(value);
}

function mask(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((v) => mask(v));
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = maskValue(k, v);
    }
    return out;
  }
  return value;
}

export class HttpTraceService implements IHttpTraceService {
  private traces: HttpTraceType[] = [];
  private listeners: ((traces: HttpTraceType[]) => void)[] = [];
  private counter = 0;

  record(input: HttpTraceInputType): HttpTraceType {
    this.counter += 1;
    const trace: HttpTraceType = {
      id: `${Date.now()}-${this.counter}`,
      method: input.method,
      url: input.url,
      reqHeaders: mask(input.reqHeaders) as Record<string, string>,
      reqBody: mask(input.reqBody),
      resBody: mask(input.resBody),
      ms: Math.round(input.ms * 10) / 10,
      at: input.at,
      ok: input.ok,
      ...(input.status !== undefined ? { status: input.status } : {}),
    };
    this.traces = [...this.traces, trace].slice(-MAX_TRACES);
    this.notify();
    return trace;
  }

  subscribe(listener: (traces: HttpTraceType[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    };
  }

  getAll(): HttpTraceType[] {
    return [...this.traces];
  }

  clear(): void {
    this.traces = [];
    this.notify();
  }

  private notify(): void {
    const snapshot = this.getAll();
    this.listeners.forEach((l) => l(snapshot));
  }
}
