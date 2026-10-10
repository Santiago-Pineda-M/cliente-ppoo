import type { IUseCase, ResultType } from '@/Domain';
import type { VehiculoEntity, VehiculoResumenItemType } from '@/Domain/Entities/VehiculoEntity';
import type { EstadoDocumentoType, TipoVehiculoType } from '@/Domain/catalogs';
import type {
  CambiarEstadoDocumentoCommandType,
  CreateVehiculoCommandType,
  CreateVehiculoResultType,
  IVehiculoApiService,
  UpdateVehiculoCommandType,
  UpdateVehiculoResultType,
  UploadDocumentosCommandType,
  UploadDocumentosResultType,
} from '@/Application/Services/IVehiculoApiService';

export class CreateVehiculoUseCase implements IUseCase<CreateVehiculoCommandType, CreateVehiculoResultType> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(cmd: CreateVehiculoCommandType): Promise<ResultType<CreateVehiculoResultType>> {
    return this.vehiculosApi.create(cmd);
  }
}

export class GetVehiculoByIdUseCase implements IUseCase<string, VehiculoEntity | null> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(id: string): Promise<ResultType<VehiculoEntity | null>> {
    return this.vehiculosApi.getById(id);
  }
}

export class GetVehiculoByPlacaUseCase implements IUseCase<string, VehiculoEntity | null> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(placa: string): Promise<ResultType<VehiculoEntity | null>> {
    return this.vehiculosApi.getByPlaca(placa);
  }
}

export class GetVehiculosByTipoUseCase implements IUseCase<TipoVehiculoType, VehiculoResumenItemType[]> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(tipo: TipoVehiculoType): Promise<ResultType<VehiculoResumenItemType[]>> {
    return this.vehiculosApi.getByTipo(tipo);
  }
}

export class GetVehiculosByTipoDocumentoUseCase implements IUseCase<string, VehiculoResumenItemType[]> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(codigo: string): Promise<ResultType<VehiculoResumenItemType[]>> {
    return this.vehiculosApi.getByTipoDocumento(codigo);
  }
}

export class GetVehiculosByEstadoDocumentoUseCase implements IUseCase<EstadoDocumentoType, VehiculoResumenItemType[]> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(estado: EstadoDocumentoType): Promise<ResultType<VehiculoResumenItemType[]>> {
    return this.vehiculosApi.getByEstadoDocumento(estado);
  }
}

export class UpdateVehiculoUseCase implements IUseCase<UpdateVehiculoCommandType, UpdateVehiculoResultType> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(cmd: UpdateVehiculoCommandType): Promise<ResultType<UpdateVehiculoResultType>> {
    return this.vehiculosApi.update(cmd);
  }
}

export class DeleteVehiculoUseCase implements IUseCase<string, void> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(id: string): Promise<ResultType<void>> {
    return this.vehiculosApi.remove(id);
  }
}

export class CambiarEstadoDocumentoUseCase implements IUseCase<CambiarEstadoDocumentoCommandType, void> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(cmd: CambiarEstadoDocumentoCommandType): Promise<ResultType<void>> {
    return this.vehiculosApi.cambiarEstadoDocumento(cmd);
  }
}

export class UploadDocumentosUseCase implements IUseCase<UploadDocumentosCommandType, UploadDocumentosResultType> {
  constructor(private readonly vehiculosApi: IVehiculoApiService) {}

  async execute(cmd: UploadDocumentosCommandType): Promise<ResultType<UploadDocumentosResultType>> {
    return this.vehiculosApi.uploadDocumentos(cmd);
  }
}
