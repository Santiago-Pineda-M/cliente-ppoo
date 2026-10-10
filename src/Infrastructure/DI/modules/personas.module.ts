// Módulo personas: api -> UCs -> PersonaDetailPloc.
import type { IPersonaApiService } from '@/Application/Services/IPersonaApiService';
import {
  CreatePersonaUseCase,
  GetPersonaUseCase,
  UpdatePersonaUseCase,
} from '@/Application/UseCases/Personas/PersonasUseCases';
import { PersonaDetailPloc } from '@/Controllers/Personas/PersonaDetailPloc';
import { PersonaApiService } from '@/Infrastructure/Api/Personas/PersonaApiService';
import { getApiClient } from './api.module';

let personasApi: IPersonaApiService | null = null;
export function getPersonaApiService(): IPersonaApiService {
  if (!personasApi) personasApi = new PersonaApiService(getApiClient());
  return personasApi;
}

let personaDetailPloc: PersonaDetailPloc | null = null;
export function getPersonaDetailPloc(): PersonaDetailPloc {
  if (!personaDetailPloc) {
    personaDetailPloc = new PersonaDetailPloc(
      new CreatePersonaUseCase(getPersonaApiService()),
      new GetPersonaUseCase(getPersonaApiService()),
      new UpdatePersonaUseCase(getPersonaApiService()),
    );
  }
  return personaDetailPloc;
}
