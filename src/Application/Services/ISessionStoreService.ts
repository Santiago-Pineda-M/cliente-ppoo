// Port: custodia de la sesión (access+refresh+apiKey+user).
// Impl con IO en Infrastructure/Services/SessionStoreService.ts (localStorage).

import type { ResultType } from '@/Domain';
import type { SessionEntity } from '@/Domain/Entities/SessionEntity';

export interface ISessionStoreService {
  load(): ResultType<SessionEntity | null>;
  save(session: SessionEntity): ResultType<void>;
  clear(): ResultType<void>;
}
