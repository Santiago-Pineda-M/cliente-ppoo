import { describe, expect, it } from 'vitest';
import { SessionEntity, type SessionPropsType } from './SessionEntity';

const base: SessionPropsType = {
  accessToken: 'access-123',
  refreshToken: 'refresh-123',
  apiKey: 'key-123',
  expiresAt: new Date(Date.now() + 60_000),
  user: { id: 'p1', login: 'jperez', nombres: 'Juan', apellidos: 'Pérez', role: 'Member' },
};

describe('SessionEntity', () => {
  it('crea sesión válida', () => {
    const r = SessionEntity.create(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.isExpired()).toBe(false);
      expect(r.value.displayName).toBe('Juan Pérez');
      // toItem nunca expone tokens
      expect(r.value.toItem()).toEqual({
        isAuthenticated: true,
        user: { id: 'p1', login: 'jperez', nombres: 'Juan', apellidos: 'Pérez', role: 'Member' },
        expiresAt: r.value.expiresAt.toISOString(),
      });
    }
  });

  it('rechaza sin tokens ni usuario', () => {
    expect(SessionEntity.create({ ...base, accessToken: '' }).ok).toBe(false);
    expect(SessionEntity.create({ ...base, refreshToken: '' }).ok).toBe(false);
    expect(SessionEntity.create({ ...base, apiKey: '  ' }).ok).toBe(false);
    expect(SessionEntity.create({ ...base, user: { ...base.user, login: '' } }).ok).toBe(false);
  });

  it('detecta expiración', () => {
    const r = SessionEntity.create({ ...base, expiresAt: new Date(Date.now() - 1000) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.isExpired()).toBe(true);
  });

  it('rehidrata desde persistencia', () => {
    const r = SessionEntity.fromPersistence({
      accessToken: 'a',
      refreshToken: 'r',
      apiKey: 'k',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      user: { id: 'p1', login: 'jperez', nombres: 'Juan', apellidos: 'Pérez', role: 'Administrator' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.user).toEqual({ id: 'p1', login: 'jperez', nombres: 'Juan', apellidos: 'Pérez', role: 'Administrator' });
  });
});
