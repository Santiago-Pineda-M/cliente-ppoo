// Módulo trazas HTTP: servicio en memoria -> PLOC lista.
// Registra el sink en ApiClient (respeta VITE_HTTP_TRACE de la config).
import type { IHttpTraceService } from '@/Application/Services/IHttpTraceService';
import { HttpTraceListPloc } from '@/Controllers/HttpTrace/HttpTraceListPloc';
import { HttpTraceService } from '@/Infrastructure/Services/HttpTraceService';
import { getApiClient } from './api.module';
import { getAppConfig } from './config.module';

// ── Servicio (singleton) ──
let traceService: IHttpTraceService | null = null;
export function getHttpTraceService(): IHttpTraceService {
  if (!traceService) traceService = new HttpTraceService();
  return traceService;
}

// ── Wiring ApiClient -> trazas (una vez) ──
let wired = false;
function wireApiClient(): void {
  if (wired) return;
  wired = true;
  if (!getAppConfig().httpTraceEnabled) return;
  getApiClient().setTraceSink((input) => {
    getHttpTraceService().record(input);
  });
}

// ── PLOC (singleton) ──
let listPloc: HttpTraceListPloc | null = null;
export function getHttpTraceListPloc(): HttpTraceListPloc {
  wireApiClient();
  if (!listPloc) listPloc = new HttpTraceListPloc(getHttpTraceService());
  return listPloc;
}
