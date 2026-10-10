import { Ploc, initialTiposDocumentoState, type ITiposDocumentoState } from '@/Domain';
import type {
  DeleteTipoDocumentoUseCase,
  ListTiposDocumentoUseCase,
  RegisterTipoDocumentoUseCase,
  UpdateTipoDocumentoUseCase,
} from '@/Application/UseCases/TiposDocumento/TiposDocumentoUseCases';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

export class TipoDocumentoListPloc extends Ploc<ITiposDocumentoState> {
  constructor(
    private readonly listUC: ListTiposDocumentoUseCase,
    private readonly registerUC: RegisterTipoDocumentoUseCase,
    private readonly updateUC: UpdateTipoDocumentoUseCase,
    private readonly deleteUC: DeleteTipoDocumentoUseCase,
  ) {
    super(initialTiposDocumentoState);
  }

  updateField<K extends keyof ITiposDocumentoState['formData']>(field: K, value: string): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  select(id: string | null): void {
    const found = id ? this.state.items.find((i) => i.id === id) : undefined;
    this.changeState({
      ...this.state,
      selectedId: id,
      errors: {},
      formData: found
        ? {
            codigo: found.codigo,
            nombre: found.nombre,
            tiposVehiculoAplicables: found.tiposVehiculoAplicables,
            codigoObligatoriedad: found.codigoObligatoriedad,
            descripcion: found.descripcion,
          }
        : this.state.formData,
    });
  }

  async load(): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.listUC.execute(undefined);
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, items: res.value.map((e) => e.toItem()) });
  }

  // submit() sin parámetros: registra, o actualiza el seleccionado.
  async submit(): Promise<void> {
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const form = this.state.formData;
    if (this.state.selectedId) {
      const res = await this.updateUC.execute({ id: this.state.selectedId, ...form });
      if (!res.ok) {
        this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
        return;
      }
    } else {
      const res = await this.registerUC.execute(form);
      if (!res.ok) {
        this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
        return;
      }
    }
    this.changeState({ ...this.state, isSubmitting: false });
    await this.load();
  }

  async removeSelected(): Promise<void> {
    if (!this.state.selectedId) return;
    const res = await this.deleteUC.execute(this.state.selectedId);
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, selectedId: null });
    await this.load();
  }

  reset(): void {
    this.changeState(initialTiposDocumentoState);
  }
}
