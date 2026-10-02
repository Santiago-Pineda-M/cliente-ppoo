import { describe, expect, it } from 'vitest';
import { HttpTraceService } from './HttpTraceService';
import type { HttpTraceInputType } from '@/Domain/States/http-trace.states';

const input: HttpTraceInputType = {
  method: 'POST',
  url: 'http://x/api/auth/login',
  reqHeaders: { 'content-type': 'application/json', authorization: 'Bearer secret', 'x-api-key': 'key-secret' },
  reqBody: { identifier: 'a', password: 'clave-secreta' },
  status: 200,
  resBody: { accessToken: 'tok', refreshToken: 'ref', data: 'visible' },
  ms: 12.3,
  at: new Date().toISOString(),
  ok: true,
};

describe('HttpTraceService', () => {
  it('enmascara credenciales y secretos', () => {
    const svc = new HttpTraceService();
    const t = svc.record(input);
    expect(t.reqHeaders['authorization']).toBe('•••');
    expect(t.reqHeaders['x-api-key']).toBe('•••');
    expect(t.reqHeaders['content-type']).toBe('application/json');
    expect(t.reqBody).toEqual({ identifier: 'a', password: '•••' });
    expect(t.resBody).toEqual({ accessToken: '•••', refreshToken: '•••', data: 'visible' });
  });

  it('acota a las últimas 100 trazas y notifica', () => {
    const svc = new HttpTraceService();
    let seen = 0;
    const off = svc.subscribe((traces) => {
      seen = traces.length;
    });
    for (let i = 0; i < 105; i++) svc.record({ ...input, url: `http://x/${i}` });
    expect(svc.getAll()).toHaveLength(100);
    expect(seen).toBe(100);
    off();
    svc.clear();
    expect(svc.getAll()).toHaveLength(0);
  });
});
