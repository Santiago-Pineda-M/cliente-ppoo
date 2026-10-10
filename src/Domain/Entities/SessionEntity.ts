// Entidad transversal: sesión de autenticación (JWT + API key por sesión).
// El usuario refleja CurrentUserOutputDto de GET /users/me
// (la API no devuelve email: se identifica por login).

import type { ApiErrorType, ResultType } from '@/Domain/IPatterns';

export type SessionUserType = {
  id: string;
  login: string;
  nombres: string;
  apellidos: string;
  role: string;
};

export type SessionPropsType = {
  accessToken: string;
  refreshToken: string;
  apiKey: string;
  expiresAt: Date;
  user: SessionUserType;
};

export type SessionItemType = {
  isAuthenticated: true;
  user: SessionUserType;
  expiresAt: string;
};

function err(message: string): ResultType<never, ApiErrorType> {
  return { ok: false, error: { kind: 'parse', message } };
}

function cleanUser(user: SessionUserType): SessionUserType {
  return {
    id: user.id.trim(),
    login: user.login.trim(),
    nombres: user.nombres.trim(),
    apellidos: user.apellidos.trim(),
    role: user.role.trim(),
  };
}

export class SessionEntity {
  private readonly _accessToken: string;
  private readonly _refreshToken: string;
  private readonly _apiKey: string;
  private readonly _expiresAt: Date;
  private readonly _user: SessionUserType;

  private constructor(props: Required<SessionPropsType>) {
    this._accessToken = props.accessToken;
    this._refreshToken = props.refreshToken;
    this._apiKey = props.apiKey;
    this._expiresAt = props.expiresAt;
    this._user = props.user;
  }

  static create(props: SessionPropsType): ResultType<SessionEntity> {
    if (!props.accessToken?.trim()) return err('Token de acceso requerido');
    if (!props.refreshToken?.trim()) return err('Token de renovación requerido');
    if (!props.apiKey?.trim()) return err('API key requerida');
    if (!(props.expiresAt instanceof Date) || Number.isNaN(props.expiresAt.getTime())) {
      return err('Expiración inválida');
    }
    if (!props.user?.id?.trim() || !props.user?.login?.trim()) {
      return err('Usuario de sesión inválido');
    }
    return {
      ok: true,
      value: new SessionEntity({
        accessToken: props.accessToken.trim(),
        refreshToken: props.refreshToken.trim(),
        apiKey: props.apiKey.trim(),
        expiresAt: props.expiresAt,
        user: cleanUser({
          id: props.user.id,
          login: props.user.login,
          nombres: props.user.nombres ?? '',
          apellidos: props.user.apellidos ?? '',
          role: props.user.role ?? 'Member',
        }),
      }),
    };
  }

  static fromPersistence(data: Record<string, unknown>): ResultType<SessionEntity> {
    const user = data.user as Partial<SessionUserType> | undefined;
    return SessionEntity.create({
      accessToken: String(data.accessToken ?? ''),
      refreshToken: String(data.refreshToken ?? ''),
      apiKey: String(data.apiKey ?? ''),
      expiresAt: new Date(String(data.expiresAt ?? '')),
      user: {
        id: String(user?.id ?? ''),
        login: String(user?.login ?? ''),
        nombres: typeof user?.nombres === 'string' ? user.nombres : '',
        apellidos: typeof user?.apellidos === 'string' ? user.apellidos : '',
        role: typeof user?.role === 'string' ? user.role : 'Member',
      },
    });
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get user(): SessionUserType {
    return { ...this._user };
  }

  get displayName(): string {
    const full = `${this._user.nombres} ${this._user.apellidos}`.trim();
    return full || this._user.login;
  }

  isExpired(now: Date = new Date()): boolean {
    return this._expiresAt.getTime() <= now.getTime();
  }

  toProps(): SessionPropsType {
    return {
      accessToken: this._accessToken,
      refreshToken: this._refreshToken,
      apiKey: this._apiKey,
      expiresAt: this._expiresAt,
      user: { ...this._user },
    };
  }

  // Nunca expone tokens: solo lo que la UI puede mostrar.
  toItem(): SessionItemType {
    return {
      isAuthenticated: true,
      user: { ...this._user },
      expiresAt: this._expiresAt.toISOString(),
    };
  }
}
