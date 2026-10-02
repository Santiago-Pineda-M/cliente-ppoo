// Contrato del contenedor DI. Se amplía por entidad (sin negocio salvo transversal).
import type { AuthPloc } from '@/Controllers/Auth/AuthPloc';
import type { HttpTraceListPloc } from '@/Controllers/HttpTrace/HttpTraceListPloc';
import type { AppConfigType } from './modules/config.module';
import { getAuthPloc } from './modules/auth.module';
import { getHttpTraceListPloc } from './modules/http-trace.module';
import { getAppConfig } from './modules/config.module';

export interface IDependencies {
  appConfig: AppConfigType;
  authPloc: AuthPloc;
  httpTraceListPloc: HttpTraceListPloc;
}

export const dependenciesLocator: IDependencies = {
  get appConfig() {
    return getAppConfig();
  },
  get authPloc() {
    return getAuthPloc();
  },
  get httpTraceListPloc() {
    return getHttpTraceListPloc();
  },
};
