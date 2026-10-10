// Módulo tipos-documento: api -> UCs -> TipoDocumentoListPloc.
import type { ITipoDocumentoApiService } from '@/Application/Services/ITipoDocumentoApiService';
import {
  DeleteTipoDocumentoUseCase,
  ListTiposDocumentoUseCase,
  RegisterTipoDocumentoUseCase,
  UpdateTipoDocumentoUseCase,
} from '@/Application/UseCases/TiposDocumento/TiposDocumentoUseCases';
import { TipoDocumentoListPloc } from '@/Controllers/TiposDocumento/TipoDocumentoListPloc';
import { TipoDocumentoApiService } from '@/Infrastructure/Api/TiposDocumento/TipoDocumentoApiService';
import { getApiClient } from './api.module';

let tiposApi: ITipoDocumentoApiService | null = null;
export function getTipoDocumentoApiService(): ITipoDocumentoApiService {
  if (!tiposApi) tiposApi = new TipoDocumentoApiService(getApiClient());
  return tiposApi;
}

let listPloc: TipoDocumentoListPloc | null = null;
export function getTipoDocumentoListPloc(): TipoDocumentoListPloc {
  if (!listPloc) {
    listPloc = new TipoDocumentoListPloc(
      new ListTiposDocumentoUseCase(getTipoDocumentoApiService()),
      new RegisterTipoDocumentoUseCase(getTipoDocumentoApiService()),
      new UpdateTipoDocumentoUseCase(getTipoDocumentoApiService()),
      new DeleteTipoDocumentoUseCase(getTipoDocumentoApiService()),
    );
  }
  return listPloc;
}
