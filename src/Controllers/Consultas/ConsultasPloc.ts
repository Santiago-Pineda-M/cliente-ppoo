import { Ploc, initialConsultasState, type IConsultasState } from '@/Domain';
import type {
  CountPersonasPorTipoUseCase,
  GetConductoresOperablesUseCase,
  GetDocumentosPorVencerUseCase,
  GetDocumentosVencidosUseCase,
} from '@/Application/UseCases/Consultas/ConsultasUseCases';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

export class ConsultasPloc extends Ploc<IConsultasState> {
  constructor(
    private readonly operablesUC: GetConductoresOperablesUseCase,
    private readonly porVencerUC: GetDocumentosPorVencerUseCase,
    private readonly vencidosUC: GetDocumentosVencidosUseCase,
    private readonly conteoUC: CountPersonasPorTipoUseCase,
  ) {
    super(initialConsultasState);
  }

  updateField<K extends 'dias' | 'cantidad'>(field: K, value: string): void {
    this.changeState({ ...this.state, [field]: value, errors: {} });
  }

  async loadOperables(): Promise<void> {
    const cantidad = Number.parseInt(this.state.cantidad, 10);
    const res = await this.operablesUC.execute(Number.isNaN(cantidad) ? undefined : cantidad);
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, operables: res.value });
  }

  async loadPorVencer(): Promise<void> {
    const dias = Number.parseInt(this.state.dias, 10);
    if (Number.isNaN(dias) || dias <= 0) {
      this.changeState({ ...this.state, errors: generalError('Días debe ser mayor que cero') });
      return;
    }
    const res = await this.porVencerUC.execute(dias);
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, porVencer: res.value });
  }

  async loadVencidos(): Promise<void> {
    const res = await this.vencidosUC.execute(undefined);
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, vencidos: res.value });
  }

  async loadConteo(): Promise<void> {
    const res = await this.conteoUC.execute(undefined);
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, conteo: res.value });
  }

  async loadAll(): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    await this.loadOperables();
    await this.loadVencidos();
    await this.loadConteo();
    this.changeState({ ...this.state, isLoading: false });
  }

  reset(): void {
    this.changeState(initialConsultasState);
  }
}
