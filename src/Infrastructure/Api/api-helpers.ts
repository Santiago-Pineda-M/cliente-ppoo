// Helpers compartidos por los XxxApiService: 404 → null y errores de mapeo.

import type { ApiErrorType, ResultType } from '@/Domain';

export function isNotFound(error: ApiErrorType): boolean {
  return error.kind === 'http' && error.status === 404;
}

export function parseError(message: string): ApiErrorType {
  return { kind: 'parse', message };
}

export function parseErr<T>(message: string): ResultType<T> {
  return { ok: false, error: parseError(message) };
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function isoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// La API serializa camelCase, pero se acepta PascalCase como respaldo:
// lee `dto[name]` y si no existe prueba con la primera letra en mayúscula.
export function val(dto: Record<string, unknown>, name: string): unknown {
  if (name in dto) return dto[name];
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  return dto[pascal];
}

export function vstr(dto: Record<string, unknown>, name: string): string {
  return str(val(dto, name));
}
