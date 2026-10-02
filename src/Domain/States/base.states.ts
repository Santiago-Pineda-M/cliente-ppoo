// Estado base compartido por todos los estados UI.

export interface IPlocState {
  isLoading: boolean;
  errors: Record<string, string[]>;
}
