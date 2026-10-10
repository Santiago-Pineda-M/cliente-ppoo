// Módulo conductores: api -> UCs -> ConductorPloc.
import type { IConductorApiService } from '@/Application/Services/IConductorApiService';
import {
  AssociateVehiculosUseCase,
  ChangeConductorEstadoUseCase,
} from '@/Application/UseCases/Conductores/ConductoresUseCases';
import { ConductorPloc } from '@/Controllers/Conductores/ConductorPloc';
import { ConductorApiService } from '@/Infrastructure/Api/Conductores/ConductorApiService';
import { getApiClient } from './api.module';

let conductoresApi: IConductorApiService | null = null;
export function getConductorApiService(): IConductorApiService {
  if (!conductoresApi) conductoresApi = new ConductorApiService(getApiClient());
  return conductoresApi;
}

let conductorPloc: ConductorPloc | null = null;
export function getConductorPloc(): ConductorPloc {
  if (!conductorPloc) {
    const api = getConductorApiService();
    conductorPloc = new ConductorPloc(
      new AssociateVehiculosUseCase(api),
      new ChangeConductorEstadoUseCase(api),
    );
  }
  return conductorPloc;
}
