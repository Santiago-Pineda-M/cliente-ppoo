import type { IUseCase, ResultType } from '@/Domain';
import type { PersonaEntity } from '@/Domain/Entities/PersonaEntity';
import type {
  CreatePersonaCommandType,
  CreatePersonaResultType,
  IPersonaApiService,
  UpdatePersonaCommandType,
  UpdatePersonaResultType,
} from '@/Application/Services/IPersonaApiService';

export class CreatePersonaUseCase implements IUseCase<CreatePersonaCommandType, CreatePersonaResultType> {
  constructor(private readonly personasApi: IPersonaApiService) {}

  async execute(cmd: CreatePersonaCommandType): Promise<ResultType<CreatePersonaResultType>> {
    return this.personasApi.create(cmd);
  }
}

export class GetPersonaUseCase implements IUseCase<string, PersonaEntity | null> {
  constructor(private readonly personasApi: IPersonaApiService) {}

  async execute(id: string): Promise<ResultType<PersonaEntity | null>> {
    return this.personasApi.getById(id);
  }
}

export class UpdatePersonaUseCase implements IUseCase<UpdatePersonaCommandType, UpdatePersonaResultType> {
  constructor(private readonly personasApi: IPersonaApiService) {}

  async execute(cmd: UpdatePersonaCommandType): Promise<ResultType<UpdatePersonaResultType>> {
    return this.personasApi.update(cmd);
  }
}
