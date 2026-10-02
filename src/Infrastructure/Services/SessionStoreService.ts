// Único lugar que toca localStorage. Custodia access+refresh+apiKey+user.
// Los tokens nunca llegan al estado React (el PLOC solo expone user + flags).

import type { ResultType } from '@/Domain';
import { SessionEntity } from '@/Domain/Entities/SessionEntity';
import type { ISessionStoreService } from '@/Application/Services/ISessionStoreService';

const STORAGE_KEY = 'ppoo.session';

type StoredSessionType = {
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  expiresAt: string;
  user: { id: string; email: string; name?: string };
};

function readStorage(): ResultType<StoredSessionType | null> {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, error: { kind: 'parse', message: 'No se pudo leer la sesión' } };
  }
  if (!raw) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(raw) as StoredSessionType };
  } catch {
    return { ok: false, error: { kind: 'parse', message: 'Sesión corrupta' } };
  }
}

export class SessionStoreService implements ISessionStoreService {
  // Espejo en memoria para headers sin parsear en cada petición.
  private memory: SessionEntity | null = null;

  load(): ResultType<SessionEntity | null> {
    if (this.memory) return { ok: true, value: this.memory };
    const stored = readStorage();
    if (!stored.ok) return stored;
    if (!stored.value) return { ok: true, value: null };
    const entity = SessionEntity.fromPersistence({
      accessToken: stored.value.accessToken,
      refreshToken: stored.value.refreshToken,
      apiKey: stored.value.apiKey,
      expiresAt: stored.value.expiresAt,
      user: stored.value.user,
    });
    if (!entity.ok) return entity;
    this.memory = entity.value;
    return entity;
  }

  save(session: SessionEntity): ResultType<void> {
    const payload: StoredSessionType = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      apiKey: session.apiKey,
      expiresAt: session.expiresAt.toISOString(),
      user: session.user,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      return { ok: false, error: { kind: 'parse', message: 'No se pudo guardar la sesión' } };
    }
    this.memory = session;
    return { ok: true, value: undefined };
  }

  clear(): ResultType<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      return { ok: false, error: { kind: 'parse', message: 'No se pudo cerrar la sesión' } };
    }
    this.memory = null;
    return { ok: true, value: undefined };
  }

  getAccessToken(): string | null {
    return this.memory?.accessToken ?? null;
  }

  getApiKey(): string | null {
    return this.memory?.apiKey ?? null;
  }
}
