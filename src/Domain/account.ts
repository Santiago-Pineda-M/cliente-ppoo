// Tipos de cuenta que viajan entre API y UI (bootstrap, API keys).
// Viven en Domain para no invertir dependencias (States/Application los importan).

export type BootstrapAdminResultType = {
  personaId: string;
  login: string;
  passwordGenerada: string;
  apiKey: string;
};

export type RegeneratedApiKeyType = {
  login: string;
  apiKey: string;
};
