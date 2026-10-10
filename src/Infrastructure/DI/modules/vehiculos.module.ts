// Módulo vehículos: api -> UCs -> VehiculoDetailPloc.
import type { IVehiculoApiService } from '@/Application/Services/IVehiculoApiService';
import {
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
import { VehiculoDetailPloc } from '@/Controllers/Vehiculos/VehiculoDetailPloc';
import { VehiculoApiService } from '@/Infrastructure/Api/Vehiculos/VehiculoApiService';
import { getApiClient } from './api.module';

let vehiculosApi: IVehiculoApiService | null = null;
export function getVehiculoApiService(): IVehiculoApiService {
  if (!vehiculosApi) vehiculosApi = new VehiculoApiService(getApiClient());
  return vehiculosApi;
}

let detailPloc: VehiculoDetailPloc | null = null;
export function getVehiculoDetailPloc(): VehiculoDetailPloc {
  if (!detailPloc) {
    const api = getVehiculoApiService();
    detailPloc = new VehiculoDetailPloc(
      new CreateVehiculoUseCase(api),
      new GetVehiculoByIdUseCase(api),
      new GetVehiculoByPlacaUseCase(api),
      new GetVehiculosByTipoUseCase(api),
      new GetVehiculosByTipoDocumentoUseCase(api),
      new GetVehiculosByEstadoDocumentoUseCase(api),
      new UpdateVehiculoUseCase(api),
      new DeleteVehiculoUseCase(api),
      new CambiarEstadoDocumentoUseCase(api),
      new UploadDocumentosUseCase(api),
    );
  }
  return detailPloc;
}
