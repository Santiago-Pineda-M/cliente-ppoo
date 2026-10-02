import { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { getAppConfig } from './config.module';

// Único ApiClient de la app (lazy). Handlers (auth/trazas) los registran
// sus módulos vía setters: el cliente no importa Application ni Controllers.
let apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = new ApiClient(getAppConfig().apiUrl);
  }
  return apiClient;
}
