// Asociación conductor–vehículo: refleja POST /conductores/vehiculos
// y consultas de conductores operables.

import type { ApiErrorType, ResultType } from '@/Domain/IPatterns';
import type { EstadoConductorType } from '@/Domain/catalogs';

export type ConductorVehiculoItemType = {
  personaId: string;
  vehiculoId: string;
  fechaAsociacion: string;
  estado: EstadoConductorType;
  nombres?: string;
  apellidos?: string;
};

function err(message: string): ResultType<never, ApiErrorType> {
  return { ok: false, error: { kind: 'parse', message } };
}

export function conductorVehiculoFromPersistence(data: Record<string, unknown>): ResultType<ConductorVehiculoItemType> {
  const estado = data.estado;
  if (estado !== 'Po' && estado !== 'Ea' && estado !== 'Ro') return err('Estado de conductor inválido');
  const personaId = String(data.personaId ?? data.PersonaId ?? '');
  const vehiculoId = String(data.vehiculoId ?? data.VehiculoId ?? '');
  if (!personaId || !vehiculoId) return err('Asociación conductor–vehículo inválida');
  const fechaRaw = data.fechaAsociacion ?? data.FechaAsociacion;
  const item: ConductorVehiculoItemType = {
    personaId,
    vehiculoId,
    fechaAsociacion: typeof fechaRaw === 'string' ? fechaRaw : '',
    estado,
  };
  if (typeof data.nombres === 'string') item.nombres = data.nombres;
  if (typeof data.apellidos === 'string') item.apellidos = data.apellidos;
  return { ok: true, value: item };
}
