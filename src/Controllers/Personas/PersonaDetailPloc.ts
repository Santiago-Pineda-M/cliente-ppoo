import { Ploc, initialPersonaState, type IPersonaState } from '@/Domain';
import type {
  CreatePersonaUseCase,
  GetPersonaUseCase,
  UpdatePersonaUseCase,
} from '@/Application/UseCases/Personas/PersonasUseCases';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

export class PersonaDetailPloc extends Ploc<IPersonaState> {
  constructor(
    private readonly createUC: CreatePersonaUseCase,
    private readonly getUC: GetPersonaUseCase,
    private readonly updateUC: UpdatePersonaUseCase,
  ) {
    super(initialPersonaState);
  }

  updateField<K extends keyof IPersonaState['formData']>(field: K, value: IPersonaState['formData'][K]): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  async load(id: string): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.getUC.execute(id);
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    if (!res.value) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError('Persona no encontrada') });
      return;
    }
    const item = res.value.toItem();
    this.changeState({
      ...this.state,
      isLoading: false,
      persona: item,
      formData: {
        tipoIdentificacion: item.tipoIdentificacion,
        numeroIdentificacion: item.numeroIdentificacion,
        nombres: item.nombres,
        apellidos: item.apellidos,
        correoElectronico: item.correoElectronico,
        tipoPersona: item.tipoPersona,
      },
    });
  }

  // submit() sin parámetros: crea con formData; si hay persona cargada, actualiza.
  async submit(): Promise<void> {
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const form = this.state.formData;
    if (this.state.persona) {
      const res = await this.updateUC.execute({
        id: this.state.persona.id,
        nombres: form.nombres,
        apellidos: form.apellidos,
        correoElectronico: form.correoElectronico,
        tipoPersona: form.tipoPersona,
      });
      if (!res.ok) {
        this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
        return;
      }
      await this.load(res.value.id);
      this.changeState({ ...this.state, isSubmitting: false });
      return;
    }
    const res = await this.createUC.execute({
      tipoIdentificacion: form.tipoIdentificacion,
      numeroIdentificacion: form.numeroIdentificacion.trim(),
      nombres: form.nombres,
      apellidos: form.apellidos,
      correoElectronico: form.correoElectronico,
      tipoPersona: form.tipoPersona,
    });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({
      ...this.state,
      isSubmitting: false,
      persona: res.value.persona.toItem(),
      createdCredentials:
        res.value.login && res.value.apiKey && res.value.passwordGenerada
          ? { login: res.value.login, apiKey: res.value.apiKey, passwordGenerada: res.value.passwordGenerada }
          : null,
    });
  }

  reset(): void {
    this.changeState(initialPersonaState);
  }
}
