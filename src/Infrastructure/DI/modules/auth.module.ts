// Módulo auth: session store -> auth api -> UCs -> AuthPloc.
// Registra en ApiClient: headers (access/apiKey) + refresh single-flight.
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';
import type { IAuthApiService } from '@/Application/Services/IAuthApiService';
import { LoginUseCase } from '@/Application/UseCases/Auth/LoginUseCase';
import { RefreshSessionUseCase } from '@/Application/UseCases/Auth/RefreshSessionUseCase';
import { LogoutUseCase } from '@/Application/UseCases/Auth/LogoutUseCase';
import { AuthPloc } from '@/Controllers/Auth/AuthPloc';
import { SessionStoreService } from '@/Infrastructure/Services/SessionStoreService';
import { AuthApiService } from '@/Infrastructure/Api/Auth/AuthApiService';
import { getApiClient } from './api.module';

// ── Session store (singleton) ──
let sessionStore: ISessionStoreService | null = null;
export function getSessionStore(): ISessionStoreService {
  if (!sessionStore) sessionStore = new SessionStoreService();
  return sessionStore;
}

// ── Auth API service (singleton) ──
let authApi: IAuthApiService | null = null;
export function getAuthApiService(): IAuthApiService {
  if (!authApi) authApi = new AuthApiService(getApiClient());
  return authApi;
}

// ── Use cases (singletons) ──
let loginUC: LoginUseCase | null = null;
function getLoginUseCase(): LoginUseCase {
  if (!loginUC) loginUC = new LoginUseCase(getAuthApiService(), getSessionStore());
  return loginUC;
}

let refreshUC: RefreshSessionUseCase | null = null;
function getRefreshSessionUseCase(): RefreshSessionUseCase {
  if (!refreshUC) refreshUC = new RefreshSessionUseCase(getAuthApiService(), getSessionStore());
  return refreshUC;
}

let logoutUC: LogoutUseCase | null = null;
function getLogoutUseCase(): LogoutUseCase {
  if (!logoutUC) logoutUC = new LogoutUseCase(getSessionStore());
  return logoutUC;
}

// ── PLOC (singleton) ──
let authPloc: AuthPloc | null = null;
export function getAuthPloc(): AuthPloc {
  wireApiClient();
  if (!authPloc) {
    authPloc = new AuthPloc(getLoginUseCase(), getRefreshSessionUseCase(), getLogoutUseCase(), getSessionStore());
  }
  return authPloc;
}

// ── Wiring ApiClient <-> auth (se registra una vez) ──
let wired = false;
function wireApiClient(): void {
  if (wired) return;
  wired = true;
  const api = getApiClient();
  const store = getSessionStore();
  api.setAuthHeaderProvider(() => {
    const loaded = store.load();
    if (!loaded.ok || !loaded.value) return { access: null, apiKey: null };
    return { access: loaded.value.accessToken, apiKey: loaded.value.apiKey };
  });
  api.setUnauthorizedHandler(async () => {
    const refreshed = await getRefreshSessionUseCase().execute(undefined);
    if (refreshed.ok) return true;
    // Refresh inválido: sesión muerta, limpiar todo para ir a login.
    await getLogoutUseCase().execute(undefined);
    getAuthPloc().reset();
    return false;
  });
}
