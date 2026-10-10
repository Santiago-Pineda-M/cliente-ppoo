import { Ploc, initialVehiculosState, type IVehiculosState } from '@/Domain';
import type { EstadoDocumentoType, TipoVehiculoType } from '@/Domain/catalogs';
import type {
  CambiarEstadoDocumentoUseCase,
  CreateVehiculoUseCase,
  DeleteVehiculoUseCase,
  GetVehiculoByIdUseCase,
  GetVehiculoByPlacaUseCase,
  GetVehiculosByEstadoDocumentoUseCase,
  GetVehiculosByTipoDocumentoUseCase,
  GetVehiculosByTipoUseCase,
  UpdateVehiculoUseCase,
  UploadDocumentosUseCase,
} from '@/Application/UseCases/Vehiculos/VehiculosUseCases';

function generalError(message: string): { general: string[] } {
  return { general: [message] };
}

function toInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export class VehiculoDetailPloc extends Ploc<IVehiculosState> {
  constructor(
    private readonly createUC: CreateVehiculoUseCase,
    private readonly getByIdUC: GetVehiculoByIdUseCase,
    private readonly getByPlacaUC: GetVehiculoByPlacaUseCase,
    private readonly byTipoUC: GetVehiculosByTipoUseCase,
    private readonly byTipoDocumentoUC: GetVehiculosByTipoDocumentoUseCase,
    private readonly byEstadoUC: GetVehiculosByEstadoDocumentoUseCase,
    private readonly updateUC: UpdateVehiculoUseCase,
    private readonly deleteUC: DeleteVehiculoUseCase,
    private readonly cambiarEstadoUC: CambiarEstadoDocumentoUseCase,
    private readonly uploadUC: UploadDocumentosUseCase,
  ) {
    super(initialVehiculosState);
  }

  updateField<K extends keyof IVehiculosState['formData']>(field: K, value: IVehiculosState['formData'][K]): void {
    this.changeState({ ...this.state, formData: { ...this.state.formData, [field]: value }, errors: {} });
  }

  async searchByPlaca(placa: string): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.getByPlacaUC.execute(placa.trim());
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    if (!res.value) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError('Vehículo no encontrado') });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, vehiculo: res.value.toItem() });
  }

  async loadById(id: string): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.getByIdUC.execute(id);
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    if (!res.value) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError('Vehículo no encontrado') });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, vehiculo: res.value.toItem() });
  }

  async filterByTipo(tipo: TipoVehiculoType): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.byTipoUC.execute(tipo);
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, resumenes: res.value });
  }

  async filterByTipoDocumento(codigo: string): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, errors: {} });
    const res = await this.byTipoDocumentoUC.execute(codigo.trim());
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, resumenes: res.value });
  }

  async filterByEstado(estado: EstadoDocumentoType): Promise<void> {
    this.changeState({ ...this.state, isLoading: true, filtroEstado: estado, errors: {} });
    const res = await this.byEstadoUC.execute(estado);
    if (!res.ok) {
      this.changeState({ ...this.state, isLoading: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isLoading: false, resumenes: res.value });
  }

  // submit() sin parámetros: crea con formData (incluye el primer documento en Base64).
  async submit(): Promise<void> {
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const form = this.state.formData;
    const res = await this.createUC.execute({
      placa: form.placa.trim(),
      tipoVehiculo: form.tipoVehiculo,
      tipoServicio: form.tipoServicio,
      tipoCombustible: form.tipoCombustible,
      capacidadPasajeros: toInt(form.capacidadPasajeros, 0),
      color: form.color,
      modelo: toInt(form.modelo, 0),
      marca: form.marca,
      linea: form.linea,
      tipoDocumentoId: form.tipoDocumentoId.trim(),
      documentoBase64: form.documentoBase64,
      nombreArchivo: form.nombreArchivo,
      fechaExpedicion: form.fechaExpedicion,
      fechaVencimiento: form.fechaVencimiento,
    });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isSubmitting: false });
    await this.loadById(res.value.id);
  }

  async updateLoaded(): Promise<void> {
    if (!this.state.vehiculo) return;
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const form = this.state.formData;
    const current = this.state.vehiculo;
    const res = await this.updateUC.execute({
      id: current.id,
      placa: form.placa.trim() || current.placa,
      tipoVehiculo: form.tipoVehiculo,
      tipoServicio: form.tipoServicio,
      tipoCombustible: form.tipoCombustible,
      capacidadPasajeros: toInt(form.capacidadPasajeros, current.capacidadPasajeros),
      color: form.color || current.color,
      modelo: toInt(form.modelo, current.modelo),
      marca: form.marca || current.marca,
      linea: form.linea || current.linea,
    });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isSubmitting: false });
    await this.loadById(res.value.id);
  }

  async removeLoaded(): Promise<void> {
    if (!this.state.vehiculo) return;
    const res = await this.deleteUC.execute(this.state.vehiculo.id);
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...initialVehiculosState });
  }

  async cambiarEstadoDocumento(tipoDocumentoId: string, estado: EstadoDocumentoType): Promise<void> {
    if (!this.state.vehiculo) return;
    const res = await this.cambiarEstadoUC.execute({
      vehiculoId: this.state.vehiculo.id,
      tipoDocumentoId,
      estado,
    });
    if (!res.ok) {
      this.changeState({ ...this.state, errors: generalError(res.error.message) });
      return;
    }
    await this.loadById(this.state.vehiculo.id);
  }

  // Carga el documento de formData al vehículo cargado.
  async uploadDocumento(): Promise<void> {
    if (!this.state.vehiculo) return;
    const form = this.state.formData;
    this.changeState({ ...this.state, isSubmitting: true, errors: {} });
    const res = await this.uploadUC.execute({
      vehiculoId: this.state.vehiculo.id,
      documentos: [
        {
          tipoDocumentoId: form.tipoDocumentoId.trim(),
          base64: form.documentoBase64,
          nombreArchivo: form.nombreArchivo,
          fechaExpedicion: form.fechaExpedicion,
          fechaVencimiento: form.fechaVencimiento,
        },
      ],
    });
    if (!res.ok) {
      this.changeState({ ...this.state, isSubmitting: false, errors: generalError(res.error.message) });
      return;
    }
    this.changeState({ ...this.state, isSubmitting: false });
    await this.loadById(res.value.vehiculoId);
  }

  reset(): void {
    this.changeState(initialVehiculosState);
  }
}
