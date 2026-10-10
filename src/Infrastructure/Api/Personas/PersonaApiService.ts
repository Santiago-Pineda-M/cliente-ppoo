// Servicio API del recurso personas. Dueño de la ruta (basePath único).
// La API habla camelCase con enums numéricos: el mapeo vive solo aquí.

import type { ResultType } from '@/Domain';
import { PersonaEntity } from '@/Domain/Entities/PersonaEntity';
import {
  TIPO_IDENTIFICACION,
  TIPO_PERSONA,
  tipoIdentificacionFromApi,
  tipoPersonaFromApi,
} from '@/Domain/catalogs';
import type {
  CreatePersonaCommandType,
  CreatePersonaResultType,
  IPersonaApiService,
  UpdatePersonaCommandType,
  UpdatePersonaResultType,
} from '@/Application/Services/IPersonaApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { isNotFound, parseErr, val, vstr } from '@/Infrastructure/Api/api-helpers';

type PersonaDtoType = Record<string, unknown>;

function toEntity(dto: PersonaDtoType): ResultType<PersonaEntity> {
  const tipoPersona = tipoPersonaFromApi(val(dto, 'tipoPersona'));
  const tipoIdentificacion = tipoIdentificacionFromApi(val(dto, 'tipoIdentificacion'));
  if (!tipoPersona || !tipoIdentificacion) return parseErr<PersonaEntity>('Persona inválida');
  const loginRaw = val(dto, 'login');
  return PersonaEntity.create({
    id: vstr(dto, 'id'),
    tipoIdentificacion,
    numeroIdentificacion: vstr(dto, 'numeroIdentificacion'),
    nombres: vstr(dto, 'nombres'),
    apellidos: vstr(dto, 'apellidos'),
    correoElectronico: vstr(dto, 'correoElectronico'),
    tipoPersona,
    login: typeof loginRaw === 'string' ? loginRaw : null,
    tieneUsuario: val(dto, 'tieneUsuario') === true,
  });
}

function optStr(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

export class PersonaApiService implements IPersonaApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/personas',
  ) {}

  async create(cmd: CreatePersonaCommandType): Promise<ResultType<CreatePersonaResultType>> {
    const res = await this.api.post<PersonaDtoType>(this.basePath, {
      tipoIdentificacion: TIPO_IDENTIFICACION[cmd.tipoIdentificacion],
      numeroIdentificacion: cmd.numeroIdentificacion,
      nombres: cmd.nombres,
      apellidos: cmd.apellidos,
      correoElectronico: cmd.correoElectronico,
      tipoPersona: TIPO_PERSONA[cmd.tipoPersona],
    });
    if (!res.ok) return res;
    const entity = toEntity(res.value);
    if (!entity.ok) return entity;
    return {
      ok: true,
      value: {
        persona: entity.value,
        login: optStr(val(res.value, 'login')),
        apiKey: optStr(val(res.value, 'apiKey')),
        passwordGenerada: optStr(val(res.value, 'passwordGenerada')),
      },
    };
  }

  async getById(id: string): Promise<ResultType<PersonaEntity | null>> {
    const res = await this.api.get<PersonaDtoType>(`${this.basePath}/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (isNotFound(res.error)) return { ok: true, value: null };
      return res;
    }
    const entity = toEntity(res.value);
    if (!entity.ok) return entity;
    return { ok: true, value: entity.value };
  }

  async update(cmd: UpdatePersonaCommandType): Promise<ResultType<UpdatePersonaResultType>> {
    const res = await this.api.put<PersonaDtoType>(`${this.basePath}/${encodeURIComponent(cmd.id)}`, {
      nombres: cmd.nombres,
      apellidos: cmd.apellidos,
      correoElectronico: cmd.correoElectronico,
      tipoPersona: TIPO_PERSONA[cmd.tipoPersona],
    });
    if (!res.ok) return res;
    const tipoPersona = tipoPersonaFromApi(val(res.value, 'tipoPersona'));
    if (!tipoPersona) return parseErr<UpdatePersonaResultType>('Persona actualizada inválida');
    const updatedAt = val(res.value, 'updatedAtUtc');
    return {
      ok: true,
      value: {
        id: vstr(res.value, 'id') || cmd.id,
        nombres: vstr(res.value, 'nombres'),
        apellidos: vstr(res.value, 'apellidos'),
        correoElectronico: vstr(res.value, 'correoElectronico'),
        tipoPersona,
        updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
      },
    };
  }
}
