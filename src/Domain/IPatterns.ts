// Contratos base del Domain. Cero dependencias externas.

export type ApiErrorType = {
  kind: 'http' | 'network' | 'parse' | 'auth';
  status?: number;
  message: string;
  fields?: Record<string, string[]>;
};

export type ResultType<T, E = ApiErrorType> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<ResultType<Output>>;
}
