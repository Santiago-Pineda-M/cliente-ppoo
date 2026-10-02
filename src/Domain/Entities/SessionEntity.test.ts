import { describe, expect, it } from 'vitest';
import { SessionEntity, type SessionPropsType } from './SessionEntity';

const base: SessionPropsType = {
  accessToken: 'access-123',
  refreshToken: 'refresh-123',
  apiKey: 'key-123',
  expiresAt: new Date(Date.now() + 60_000),
  user: { id: 'u1', email: 'a@b.c' },
};

describe('SessionEntity', () => {
  it('crea sesión válida', () => {
    const r = SessionEntity.create(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.isExpired()).toBe(false);
      // toItem nunca expone tokens
      expect(r.value.toItem()).toEqual({
        isAuthenticated: true,
        user: { id: 'u1', email: 'a@b.c' },
        expiresAt: r.value.expiresAt.toISOString(),
      });
    }
  });

  it('rechaza sin tokens', () => {
    expect(SessionEntity.create({ ...base, accessToken: '' }).ok).toBe(false);
    expect(SessionEntity.create({ ...base, refreshToken: '' }).ok).toBe(false);
    expect(SessionEntity.create({ ...base, apiKey: '  ' }).ok).toBe(false);
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
      user: { id: 'u1', email: 'a@b.c', name: 'Ana' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.user).toEqual({ id: 'u1', email: 'a@b.c', name: 'Ana' });
  });
});
