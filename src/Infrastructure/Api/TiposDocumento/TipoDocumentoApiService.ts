// Servicio API del catálogo de tipos de documento. Dueño de la ruta (basePath único).
// La API habla camelCase en JSON: el mapeo vive solo aquí.

import type { ResultType } from '@/Domain';
import { TipoDocumentoEntity } from '@/Domain/Entities/TipoDocumentoEntity';
import type {
  ITipoDocumentoApiService,
  RegisterTipoDocumentoCommandType,
  UpdateTipoDocumentoCommandType,
} from '@/Application/Services/ITipoDocumentoApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { isNotFound, parseErr, vstr } from '@/Infrastructure/Api/api-helpers';

type TipoDocumentoDtoType = Record<string, unknown>;

function toEntity(dto: TipoDocumentoDtoType): ResultType<TipoDocumentoEntity> {
  return TipoDocumentoEntity.create({
    id: vstr(dto, 'id'),
    codigo: vstr(dto, 'codigo'),
    nombre: vstr(dto, 'nombre'),
    tiposVehiculoAplicables: vstr(dto, 'tiposVehiculoAplicables'),
    codigoObligatoriedad: vstr(dto, 'codigoObligatoriedad'),
    descripcion: vstr(dto, 'descripcion'),
  });
}

export class TipoDocumentoApiService implements ITipoDocumentoApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/tipos-documento',
  ) {}

  async register(cmd: RegisterTipoDocumentoCommandType): Promise<ResultType<TipoDocumentoEntity>> {
    const res = await this.api.post<TipoDocumentoDtoType>(this.basePath, {
      codigo: cmd.codigo,
      nombre: cmd.nombre,
      tiposVehiculoAplicables: cmd.tiposVehiculoAplicables,
      codigoObligatoriedad: cmd.codigoObligatoriedad,
      descripcion: cmd.descripcion,
    });
    if (!res.ok) return res;
    return toEntity(res.value);
  }

  async list(): Promise<ResultType<TipoDocumentoEntity[]>> {
    const res = await this.api.get<TipoDocumentoDtoType[]>(this.basePath);
    if (!res.ok) return res;
    const out: TipoDocumentoEntity[] = [];
    for (const dto of res.value) {
      const entity = toEntity(dto);
      if (!entity.ok) return parseErr<TipoDocumentoEntity[]>(entity.error.message);
      out.push(entity.value);
    }
    return { ok: true, value: out };
  }

  async getById(id: string): Promise<ResultType<TipoDocumentoEntity | null>> {
    const res = await this.api.get<TipoDocumentoDtoType>(`${this.basePath}/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (isNotFound(res.error)) return { ok: true, value: null };
      return res;
    }
    const entity = toEntity(res.value);
    if (!entity.ok) return entity;
    return { ok: true, value: entity.value };
  }

  async update(cmd: UpdateTipoDocumentoCommandType): Promise<ResultType<TipoDocumentoEntity>> {
    const res = await this.api.put<TipoDocumentoDtoType>(`${this.basePath}/${encodeURIComponent(cmd.id)}`, {
      nombre: cmd.nombre,
      tiposVehiculoAplicables: cmd.tiposVehiculoAplicables,
      codigoObligatoriedad: cmd.codigoObligatoriedad,
      descripcion: cmd.descripcion,
    });
    if (!res.ok) return res;
    return toEntity(res.value);
  }

  async remove(id: string): Promise<ResultType<void>> {
    const res = await this.api.del<unknown>(`${this.basePath}/${encodeURIComponent(id)}`);
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }
}
