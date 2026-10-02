// Port: acumulador de trazas HTTP (drawer lateral).
// Impl en memoria en Infrastructure/Services/HttpTraceService.ts.

import type { HttpTraceInputType, HttpTraceType } from '@/Domain/States/http-trace.states';

export interface IHttpTraceService {
  record(input: HttpTraceInputType): HttpTraceType;
  subscribe(listener: (traces: HttpTraceType[]) => void): () => void;
  getAll(): HttpTraceType[];
  clear(): void;
}
