// Servicio API del recurso conductores. Dueño de la ruta (basePath único).
// La API habla camelCase con enums numéricos: el mapeo vive solo aquí.

import type { ResultType } from '@/Domain';
import { conductorVehiculoFromPersistence, type ConductorVehiculoItemType } from '@/Domain/Entities/ConductorVehiculo';
import { ESTADO_CONDUCTOR, estadoConductorFromApi } from '@/Domain/catalogs';
import type {
  AssociateVehiculosCommandType,
  ChangeConductorEstadoCommandType,
  IConductorApiService,
} from '@/Application/Services/IConductorApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { parseErr, val, vstr } from '@/Infrastructure/Api/api-helpers';

function toItem(dto: Record<string, unknown>): ResultType<ConductorVehiculoItemType> {
  const item: Record<string, unknown> = {
    personaId: vstr(dto, 'personaId'),
    vehiculoId: vstr(dto, 'vehiculoId'),
    fechaAsociacion: vstr(dto, 'fechaAsociacion'),
    estado: estadoConductorFromApi(val(dto, 'estado')) ?? val(dto, 'estado'),
  };
  const nombres = vstr(dto, 'nombres');
  const apellidos = vstr(dto, 'apellidos');
  if (nombres) item.nombres = nombres;
  if (apellidos) item.apellidos = apellidos;
  return conductorVehiculoFromPersistence(item);
}

export class ConductorApiService implements IConductorApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/conductores',
  ) {}

  async associate(cmd: AssociateVehiculosCommandType): Promise<ResultType<ConductorVehiculoItemType[]>> {
    const res = await this.api.post<Record<string, unknown>[]>(`${this.basePath}/vehiculos`, {
      personaId: cmd.personaId,
      vehiculoIds: cmd.vehiculoIds,
    });
    if (!res.ok) return res;
    const out: ConductorVehiculoItemType[] = [];
    for (const dto of res.value) {
      const parsed = toItem(dto);
      if (!parsed.ok) return parseErr<ConductorVehiculoItemType[]>(parsed.error.message);
      out.push(parsed.value);
    }
    return { ok: true, value: out };
  }

  async changeEstado(cmd: ChangeConductorEstadoCommandType): Promise<ResultType<void>> {
    const res = await this.api.put<unknown>(`${this.basePath}/estado`, {
      personaId: cmd.personaId,
      vehiculoId: cmd.vehiculoId,
      estado: ESTADO_CONDUCTOR[cmd.estado],
    });
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }
}
