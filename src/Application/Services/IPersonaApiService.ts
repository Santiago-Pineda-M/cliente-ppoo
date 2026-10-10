// Port de datos remotos: recurso personas (/personas).
// Requiere JWT + X-Api-Key. Ruta en Infrastructure/Api/Personas/.

import type { ResultType } from '@/Domain';
import type { PersonaEntity } from '@/Domain/Entities/PersonaEntity';
import type { TipoIdentificacionType, TipoPersonaType } from '@/Domain/catalogs';

export type CreatePersonaCommandType = {
  tipoIdentificacion: TipoIdentificacionType;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  tipoPersona: TipoPersonaType;
};

export type CreatePersonaResultType = {
  persona: PersonaEntity;
  login: string | null;
  apiKey: string | null;
  passwordGenerada: string | null;
};

export type UpdatePersonaCommandType = {
  id: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  tipoPersona: TipoPersonaType;
};

export type UpdatePersonaResultType = {
  id: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  tipoPersona: TipoPersonaType;
  updatedAt: string | null;
};

export interface IPersonaApiService {
  create(cmd: CreatePersonaCommandType): Promise<ResultType<CreatePersonaResultType>>;
  getById(id: string): Promise<ResultType<PersonaEntity | null>>;
  update(cmd: UpdatePersonaCommandType): Promise<ResultType<UpdatePersonaResultType>>;
}
