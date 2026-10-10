import type { IUseCase, ResultType } from '@/Domain';
import type { TipoDocumentoEntity } from '@/Domain/Entities/TipoDocumentoEntity';
import type {
  ITipoDocumentoApiService,
  RegisterTipoDocumentoCommandType,
  UpdateTipoDocumentoCommandType,
} from '@/Application/Services/ITipoDocumentoApiService';

export class RegisterTipoDocumentoUseCase implements IUseCase<RegisterTipoDocumentoCommandType, TipoDocumentoEntity> {
  constructor(private readonly tiposApi: ITipoDocumentoApiService) {}

  async execute(cmd: RegisterTipoDocumentoCommandType): Promise<ResultType<TipoDocumentoEntity>> {
    return this.tiposApi.register(cmd);
  }
}

export class ListTiposDocumentoUseCase implements IUseCase<undefined, TipoDocumentoEntity[]> {
  constructor(private readonly tiposApi: ITipoDocumentoApiService) {}

  async execute(_input: undefined): Promise<ResultType<TipoDocumentoEntity[]>> {
    return this.tiposApi.list();
  }
}

export class GetTipoDocumentoUseCase implements IUseCase<string, TipoDocumentoEntity | null> {
  constructor(private readonly tiposApi: ITipoDocumentoApiService) {}

  async execute(id: string): Promise<ResultType<TipoDocumentoEntity | null>> {
    return this.tiposApi.getById(id);
  }
}

export class UpdateTipoDocumentoUseCase implements IUseCase<UpdateTipoDocumentoCommandType, TipoDocumentoEntity> {
  constructor(private readonly tiposApi: ITipoDocumentoApiService) {}

  async execute(cmd: UpdateTipoDocumentoCommandType): Promise<ResultType<TipoDocumentoEntity>> {
    return this.tiposApi.update(cmd);
  }
}

export class DeleteTipoDocumentoUseCase implements IUseCase<string, void> {
  constructor(private readonly tiposApi: ITipoDocumentoApiService) {}

  async execute(id: string): Promise<ResultType<void>> {
    return this.tiposApi.remove(id);
  }
}
