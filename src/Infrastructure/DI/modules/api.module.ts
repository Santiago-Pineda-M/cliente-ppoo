import { ApiClient } from '@/Infrastructure/Api/ApiClient';

// Único lugar con import.meta.env. Instancia lazy del ApiClient.
let apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    const baseUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (!baseUrl) throw new Error('Falta VITE_API_URL en .env');
    apiClient = new ApiClient(baseUrl);
  }
  return apiClient;
}
