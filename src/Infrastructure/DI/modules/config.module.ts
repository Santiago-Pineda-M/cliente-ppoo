// Única lectura de import.meta.env de todo el proyecto.
// Los componentes obtienen la config vía useDependencies(), nunca import.meta.env.

export type AppConfigType = {
  apiUrl: string;
  httpTraceEnabled: boolean;
};

let config: AppConfigType | null = null;

export function getAppConfig(): AppConfigType {
  if (!config) {
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (!apiUrl) throw new Error('Falta VITE_API_URL en .env');
    config = {
      apiUrl,
      httpTraceEnabled: (import.meta.env.VITE_HTTP_TRACE as string | undefined) !== 'false',
    };
  }
  return config;
}
