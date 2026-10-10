// Entidad Vehículo: refleja consultas y CRUD de /vehiculos.
// Documentos y conductores anidados como tipos de valor (vienen del mismo JSON).

import type { ApiErrorType, ResultType } from '@/Domain/IPatterns';
import type {
  EstadoConductorType,
  EstadoDocumentoType,
  TipoCombustibleType,
  TipoServicioType,
  TipoVehiculoType,
} from '@/Domain/catalogs';

export type VehiculoDocumentoType = {
  tipoDocumentoId: string;
  nombreArchivo: string;
  contentType: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  estado: EstadoDocumentoType;
  tamano: number;
};

export type VehiculoConductorType = {
  personaId: string;
  nombres: string;
  apellidos: string;
  fechaAsociacion: string;
  estado: EstadoConductorType;
};

export type VehiculoPropsType = {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculoType;
  tipoServicio: TipoServicioType;
  tipoCombustible: TipoCombustibleType;
  capacidadPasajeros: number;
  color: string;
  modelo: number;
  marca: string;
  linea: string;
  documentos: VehiculoDocumentoType[];
  conductores: VehiculoConductorType[];
};

export type VehiculoItemType = VehiculoPropsType;

export type VehiculoResumenItemType = {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculoType;
  tipoServicio: TipoServicioType;
};

function err(message: string): ResultType<never, ApiErrorType> {
  return { ok: false, error: { kind: 'parse', message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseDocumento(raw: unknown): VehiculoDocumentoType | null {
  if (!isRecord(raw)) return null;
  const estado = raw.estado;
  if (estado !== 'Habilitado' && estado !== 'Vencido' && estado !== 'EnVerificacion') return null;
  if (typeof raw.tipoDocumentoId !== 'string') return null;
  return {
    tipoDocumentoId: raw.tipoDocumentoId,
    nombreArchivo: typeof raw.nombreArchivo === 'string' ? raw.nombreArchivo : '',
    contentType: typeof raw.contentType === 'string' ? raw.contentType : '',
    fechaExpedicion: typeof raw.fechaExpedicion === 'string' ? raw.fechaExpedicion : '',
    fechaVencimiento: typeof raw.fechaVencimiento === 'string' ? raw.fechaVencimiento : '',
    estado,
    tamano: typeof raw.tamano === 'number' ? raw.tamano : 0,
  };
}

function parseConductor(raw: unknown): VehiculoConductorType | null {
  if (!isRecord(raw)) return null;
  const estado = raw.estado;
  if (estado !== 'Po' && estado !== 'Ea' && estado !== 'Ro') return null;
  if (typeof raw.personaId !== 'string') return null;
  return {
    personaId: raw.personaId,
    nombres: typeof raw.nombres === 'string' ? raw.nombres : '',
    apellidos: typeof raw.apellidos === 'string' ? raw.apellidos : '',
    fechaAsociacion: typeof raw.fechaAsociacion === 'string' ? raw.fechaAsociacion : '',
    estado,
  };
}

export class VehiculoEntity {
  private constructor(private readonly props: VehiculoPropsType) {}

  static create(props: VehiculoPropsType): ResultType<VehiculoEntity> {
    if (!props.id?.trim()) return err('Id de vehículo requerido');
    if (!props.placa?.trim()) return err('Placa requerida');
    return { ok: true, value: new VehiculoEntity({ ...props }) };
  }

  static fromPersistence(data: Record<string, unknown>): ResultType<VehiculoEntity> {
    const tipoVehiculo = data.tipoVehiculo;
    const tipoServicio = data.tipoServicio;
    const tipoCombustible = data.tipoCombustible;
    if (tipoVehiculo !== 'Automovil' && tipoVehiculo !== 'Motocicleta') return err('Tipo de vehículo inválido');
    if (tipoServicio !== 'Publico' && tipoServicio !== 'Privado') return err('Tipo de servicio inválido');
    if (tipoCombustible !== 'Gasolina' && tipoCombustible !== 'Gas' && tipoCombustible !== 'Disel') {
      return err('Tipo de combustible inválido');
    }
    const documentosRaw = Array.isArray(data.documentos) ? data.documentos : [];
    const conductoresRaw = Array.isArray(data.conductores) ? data.conductores : [];
    const documentos: VehiculoDocumentoType[] = [];
    for (const raw of documentosRaw) {
      const parsed = parseDocumento(raw);
      if (!parsed) return err('Documento de vehículo inválido');
      documentos.push(parsed);
    }
    const conductores: VehiculoConductorType[] = [];
    for (const raw of conductoresRaw) {
      const parsed = parseConductor(raw);
      if (!parsed) return err('Conductor de vehículo inválido');
      conductores.push(parsed);
    }
    return VehiculoEntity.create({
      id: String(data.id ?? ''),
      placa: String(data.placa ?? ''),
      tipoVehiculo,
      tipoServicio,
      tipoCombustible,
      capacidadPasajeros: typeof data.capacidadPasajeros === 'number' ? data.capacidadPasajeros : 0,
      color: String(data.color ?? ''),
      modelo: typeof data.modelo === 'number' ? data.modelo : 0,
      marca: String(data.marca ?? ''),
      linea: String(data.linea ?? ''),
      documentos,
      conductores,
    });
  }

  static resumenFromPersistence(data: Record<string, unknown>): ResultType<VehiculoResumenItemType> {
    const tipoVehiculo = data.tipoVehiculo;
    const tipoServicio = data.tipoServicio;
    if (tipoVehiculo !== 'Automovil' && tipoVehiculo !== 'Motocicleta') return err('Tipo de vehículo inválido');
    if (tipoServicio !== 'Publico' && tipoServicio !== 'Privado') return err('Tipo de servicio inválido');
    const id = String(data.id ?? '');
    const placa = String(data.placa ?? '');
    if (!id || !placa) return err('Vehículo inválido');
    return { ok: true, value: { id, placa, tipoVehiculo, tipoServicio } };
  }

  get id(): string {
    return this.props.id;
  }

  toProps(): VehiculoPropsType {
    return { ...this.props, documentos: [...this.props.documentos], conductores: [...this.props.conductores] };
  }

  toItem(): VehiculoItemType {
    return this.toProps();
  }
}
