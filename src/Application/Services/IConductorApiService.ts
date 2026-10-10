// Port de datos remotos: conductores (/conductores).
// Requiere JWT + X-Api-Key. Ruta en Infrastructure/Api/Conductores/.

import type { ResultType } from '@/Domain';
import type { ConductorVehiculoItemType } from '@/Domain/Entities/ConductorVehiculo';
import type { EstadoConductorType } from '@/Domain/catalogs';

export type AssociateVehiculosCommandType = {
  personaId: string;
  vehiculoIds: string[];
};

export type ChangeConductorEstadoCommandType = {
  personaId: string;
  vehiculoId: string;
  estado: EstadoConductorType;
};

export interface IConductorApiService {
  associate(cmd: AssociateVehiculosCommandType): Promise<ResultType<ConductorVehiculoItemType[]>>;
  changeEstado(cmd: ChangeConductorEstadoCommandType): Promise<ResultType<void>>;
}
