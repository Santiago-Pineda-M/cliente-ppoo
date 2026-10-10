import type { IUseCase, ResultType } from '@/Domain';
import type {
  ConductorOperableItemType,
  DocumentoVencimientoItemType,
  IConsultaApiService,
  PersonaConteoItemType,
} from '@/Application/Services/IConsultaApiService';

export class GetConductoresOperablesUseCase implements IUseCase<number | undefined, ConductorOperableItemType[]> {
  constructor(private readonly consultasApi: IConsultaApiService) {}

  async execute(cantidad: number | undefined): Promise<ResultType<ConductorOperableItemType[]>> {
    return this.consultasApi.conductoresOperables(cantidad);
  }
}

export class GetDocumentosPorVencerUseCase implements IUseCase<number, DocumentoVencimientoItemType[]> {
  constructor(private readonly consultasApi: IConsultaApiService) {}

  async execute(dias: number): Promise<ResultType<DocumentoVencimientoItemType[]>> {
    return this.consultasApi.documentosPorVencer(dias);
  }
}

export class GetDocumentosVencidosUseCase implements IUseCase<undefined, DocumentoVencimientoItemType[]> {
  constructor(private readonly consultasApi: IConsultaApiService) {}

  async execute(_input: undefined): Promise<ResultType<DocumentoVencimientoItemType[]>> {
    return this.consultasApi.documentosVencidos();
  }
}

export class CountPersonasPorTipoUseCase implements IUseCase<undefined, PersonaConteoItemType[]> {
  constructor(private readonly consultasApi: IConsultaApiService) {}

  async execute(_input: undefined): Promise<ResultType<PersonaConteoItemType[]>> {
    return this.consultasApi.personasPorTipo();
  }
}
