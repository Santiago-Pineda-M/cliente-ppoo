// Módulo consultas públicas: api -> UCs -> ConsultasPloc.
import type { IConsultaApiService } from '@/Application/Services/IConsultaApiService';
import {
  CountPersonasPorTipoUseCase,
  GetConductoresOperablesUseCase,
  GetDocumentosPorVencerUseCase,
  GetDocumentosVencidosUseCase,
} from '@/Application/UseCases/Consultas/ConsultasUseCases';
import { ConsultasPloc } from '@/Controllers/Consultas/ConsultasPloc';
import { ConsultaApiService } from '@/Infrastructure/Api/Consultas/ConsultaApiService';
import { getApiClient } from './api.module';

let consultasApi: IConsultaApiService | null = null;
export function getConsultaApiService(): IConsultaApiService {
  if (!consultasApi) consultasApi = new ConsultaApiService(getApiClient());
  return consultasApi;
}

let consultasPloc: ConsultasPloc | null = null;
export function getConsultasPloc(): ConsultasPloc {
  if (!consultasPloc) {
    const api = getConsultaApiService();
    consultasPloc = new ConsultasPloc(
      new GetConductoresOperablesUseCase(api),
      new GetDocumentosPorVencerUseCase(api),
      new GetDocumentosVencidosUseCase(api),
      new CountPersonasPorTipoUseCase(api),
    );
  }
  return consultasPloc;
}
