import { Ploc, initialConductoresState, type IConductoresState } from '@/Domain';
import type {
  AssociateVehiculosUseCase,
  ChangeConductorEstadoUseCase,
} from '@/Application/UseCases/Conductores/ConductoresUseCases';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

export class ConductorPloc extends Ploc<IConductoresState> {
  constructor(
    private readonly associateUC: AssociateVehiculosUseCase,
    private readonly changeEstadoUC: ChangeConductorEstadoUseCase,
  ) {
    super(initialConductoresState);
  }

  updateField<K extends keyof IConductoresState['formData']>(
    field: K,
    value: IConductoresState['formData'][K],
  ): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  // submit() sin parámetros: asocia los vehículos (IDs separados por coma) al conductor.
  async submit(): Promise<void> {
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const form = this.state.formData;
    const vehiculoIds = form.vehiculoIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    const res = await this.associateUC.execute({ personaId: form.personaId.trim(), vehiculoIds });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isSubmitting: false, asociaciones: res.value });
  }

  async changeEstado(): Promise<void> {
    const form = this.state.formData;
    const res = await this.changeEstadoUC.execute({
      personaId: form.personaId.trim(),
      vehiculoId: form.vehiculoId.trim(),
      estado: form.estado,
    });
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
    }
  }

  reset(): void {
    this.changeState(initialConductoresState);
  }
}
