// Servicio API del recurso vehículos. Dueño de la ruta (basePath único).
// Solo getByPlaca es público (auth:false); el resto exige JWT + X-Api-Key.
// La API habla camelCase con enums numéricos: el mapeo vive solo aquí.

import type { ResultType } from '@/Domain';
import { VehiculoEntity, type VehiculoResumenItemType } from '@/Domain/Entities/VehiculoEntity';
import {
  ESTADO_DOCUMENTO,
  TIPO_COMBUSTIBLE,
  TIPO_SERVICIO,
  TIPO_VEHICULO,
  estadoConductorFromApi,
  estadoDocumentoFromApi,
  tipoCombustibleFromApi,
  tipoServicioFromApi,
  tipoVehiculoFromApi,
} from '@/Domain/catalogs';
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
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { isNotFound, parseErr, val, vstr } from '@/Infrastructure/Api/api-helpers';

type VehiculoDtoType = Record<string, unknown>;

function toEntity(dto: VehiculoDtoType): ResultType<VehiculoEntity> {
  const documentosRaw = val(dto, 'documentos');
  const conductoresRaw = val(dto, 'conductores');
  return VehiculoEntity.fromPersistence({
    id: vstr(dto, 'id'),
    placa: vstr(dto, 'placa'),
    tipoVehiculo: tipoVehiculoFromApi(val(dto, 'tipoVehiculo')) ?? val(dto, 'tipoVehiculo'),
    tipoServicio: tipoServicioFromApi(val(dto, 'tipoServicio')) ?? val(dto, 'tipoServicio'),
    tipoCombustible: tipoCombustibleFromApi(val(dto, 'tipoCombustible')) ?? val(dto, 'tipoCombustible'),
    capacidadPasajeros: val(dto, 'capacidadPasajeros'),
    color: vstr(dto, 'color'),
    modelo: val(dto, 'modelo'),
    marca: vstr(dto, 'marca'),
    linea: vstr(dto, 'linea'),
    documentos: Array.isArray(documentosRaw)
      ? documentosRaw.map((d) => {
          const doc = d as Record<string, unknown>;
          return {
            tipoDocumentoId: vstr(doc, 'tipoDocumentoId'),
            nombreArchivo: vstr(doc, 'nombreArchivo'),
            contentType: vstr(doc, 'contentType'),
            fechaExpedicion: vstr(doc, 'fechaExpedicion'),
            fechaVencimiento: vstr(doc, 'fechaVencimiento'),
            estado: estadoDocumentoFromApi(val(doc, 'estado')) ?? val(doc, 'estado'),
            tamano: typeof val(doc, 'tamano') === 'number' ? (val(doc, 'tamano') as number) : 0,
          };
        })
      : [],
    conductores: Array.isArray(conductoresRaw)
      ? conductoresRaw.map((c) => {
          const conductor = c as Record<string, unknown>;
          return {
            personaId: vstr(conductor, 'personaId'),
            nombres: vstr(conductor, 'nombres'),
            apellidos: vstr(conductor, 'apellidos'),
            fechaAsociacion: vstr(conductor, 'fechaAsociacion'),
            estado: estadoConductorFromApi(val(conductor, 'estado')) ?? val(conductor, 'estado'),
          };
        })
      : [],
  });
}

function toResumen(dto: VehiculoDtoType): ResultType<VehiculoResumenItemType> {
  return VehiculoEntity.resumenFromPersistence({
    id: vstr(dto, 'id'),
    placa: vstr(dto, 'placa'),
    tipoVehiculo: tipoVehiculoFromApi(val(dto, 'tipoVehiculo')) ?? val(dto, 'tipoVehiculo'),
    tipoServicio: tipoServicioFromApi(val(dto, 'tipoServicio')) ?? val(dto, 'tipoServicio'),
  });
}

function toResumenList(dtos: VehiculoDtoType[]): ResultType<VehiculoResumenItemType[]> {
  const out: VehiculoResumenItemType[] = [];
  for (const dto of dtos) {
    const parsed = toResumen(dto);
    if (!parsed.ok) return parsed;
    out.push(parsed.value);
  }
  return { ok: true, value: out };
}

export class VehiculoApiService implements IVehiculoApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/vehiculos',
  ) {}

  async getByPlaca(placa: string): Promise<ResultType<VehiculoEntity | null>> {
    const res = await this.api.get<VehiculoDtoType>(
      `${this.basePath}/placa/${encodeURIComponent(placa)}`,
      { auth: false },
    );
    if (!res.ok) {
      if (isNotFound(res.error)) return { ok: true, value: null };
      return res;
    }
    const entity = toEntity(res.value);
    if (!entity.ok) return entity;
    return { ok: true, value: entity.value };
  }

  async getById(id: string): Promise<ResultType<VehiculoEntity | null>> {
    const res = await this.api.get<VehiculoDtoType>(`${this.basePath}/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (isNotFound(res.error)) return { ok: true, value: null };
      return res;
    }
    const entity = toEntity(res.value);
    if (!entity.ok) return entity;
    return { ok: true, value: entity.value };
  }

  async getByTipo(tipo: Parameters<IVehiculoApiService['getByTipo']>[0]): Promise<ResultType<VehiculoResumenItemType[]>> {
    const res = await this.api.get<VehiculoDtoType[]>(`${this.basePath}/tipo/${TIPO_VEHICULO[tipo]}`);
    if (!res.ok) return res;
    return toResumenList(res.value);
  }

  async getByTipoDocumento(codigo: string): Promise<ResultType<VehiculoResumenItemType[]>> {
    const res = await this.api.get<VehiculoDtoType[]>(`${this.basePath}/tipo-documento/${encodeURIComponent(codigo)}`);
    if (!res.ok) return res;
    return toResumenList(res.value);
  }

  async getByEstadoDocumento(
    estado: Parameters<IVehiculoApiService['getByEstadoDocumento']>[0],
  ): Promise<ResultType<VehiculoResumenItemType[]>> {
    const res = await this.api.get<VehiculoDtoType[]>(`${this.basePath}/estado-documento/${ESTADO_DOCUMENTO[estado]}`);
    if (!res.ok) return res;
    return toResumenList(res.value);
  }

  async create(cmd: CreateVehiculoCommandType): Promise<ResultType<CreateVehiculoResultType>> {
    const res = await this.api.post<VehiculoDtoType>(this.basePath, {
      placa: cmd.placa,
      tipoVehiculo: TIPO_VEHICULO[cmd.tipoVehiculo],
      tipoServicio: TIPO_SERVICIO[cmd.tipoServicio],
      tipoCombustible: TIPO_COMBUSTIBLE[cmd.tipoCombustible],
      capacidadPasajeros: cmd.capacidadPasajeros,
      color: cmd.color,
      modelo: cmd.modelo,
      marca: cmd.marca,
      linea: cmd.linea,
      tipoDocumentoId: cmd.tipoDocumentoId,
      documentoBase64: cmd.documentoBase64,
      nombreArchivo: cmd.nombreArchivo,
      fechaExpedicion: cmd.fechaExpedicion,
      fechaVencimiento: cmd.fechaVencimiento,
    });
    if (!res.ok) return res;
    const dto = res.value;
    const tipoVehiculo = tipoVehiculoFromApi(val(dto, 'tipoVehiculo'));
    const tipoServicio = tipoServicioFromApi(val(dto, 'tipoServicio'));
    const tipoCombustible = tipoCombustibleFromApi(val(dto, 'tipoCombustible'));
    const estado = estadoDocumentoFromApi(val(dto, 'estado'));
    if (!tipoVehiculo || !tipoServicio || !tipoCombustible || !estado) {
      return parseErr<CreateVehiculoResultType>('Vehículo creado inválido');
    }
    const capacidad = val(dto, 'capacidadPasajeros');
    const modelo = val(dto, 'modelo');
    return {
      ok: true,
      value: {
        id: vstr(dto, 'id'),
        placa: vstr(dto, 'placa'),
        tipoVehiculo,
        tipoServicio,
        tipoCombustible,
        capacidadPasajeros: typeof capacidad === 'number' ? capacidad : cmd.capacidadPasajeros,
        color: vstr(dto, 'color'),
        modelo: typeof modelo === 'number' ? modelo : cmd.modelo,
        marca: vstr(dto, 'marca'),
        linea: vstr(dto, 'linea'),
        tipoDocumentoId: vstr(dto, 'tipoDocumentoId'),
        nombreArchivo: vstr(dto, 'nombreArchivo'),
        fechaExpedicion: vstr(dto, 'fechaExpedicion'),
        fechaVencimiento: vstr(dto, 'fechaVencimiento'),
        estado,
      },
    };
  }

  async update(cmd: UpdateVehiculoCommandType): Promise<ResultType<UpdateVehiculoResultType>> {
    const res = await this.api.put<VehiculoDtoType>(`${this.basePath}/${encodeURIComponent(cmd.id)}`, {
      placa: cmd.placa,
      tipoVehiculo: TIPO_VEHICULO[cmd.tipoVehiculo],
      tipoServicio: TIPO_SERVICIO[cmd.tipoServicio],
      tipoCombustible: TIPO_COMBUSTIBLE[cmd.tipoCombustible],
      capacidadPasajeros: cmd.capacidadPasajeros,
      color: cmd.color,
      modelo: cmd.modelo,
      marca: cmd.marca,
      linea: cmd.linea,
    });
    if (!res.ok) return res;
    const dto = res.value;
    const capacidad = val(dto, 'capacidadPasajeros');
    const modelo = val(dto, 'modelo');
    const updatedAt = val(dto, 'updatedAtUtc');
    return {
      ok: true,
      value: {
        id: vstr(dto, 'id') || cmd.id,
        placa: vstr(dto, 'placa') || cmd.placa,
        tipoVehiculo: tipoVehiculoFromApi(val(dto, 'tipoVehiculo')) ?? cmd.tipoVehiculo,
        tipoServicio: tipoServicioFromApi(val(dto, 'tipoServicio')) ?? cmd.tipoServicio,
        tipoCombustible: tipoCombustibleFromApi(val(dto, 'tipoCombustible')) ?? cmd.tipoCombustible,
        capacidadPasajeros: typeof capacidad === 'number' ? capacidad : cmd.capacidadPasajeros,
        color: vstr(dto, 'color') || cmd.color,
        modelo: typeof modelo === 'number' ? modelo : cmd.modelo,
        marca: vstr(dto, 'marca') || cmd.marca,
        linea: vstr(dto, 'linea') || cmd.linea,
        updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
      },
    };
  }

  async remove(id: string): Promise<ResultType<void>> {
    const res = await this.api.del<unknown>(`${this.basePath}/${encodeURIComponent(id)}`);
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }

  async cambiarEstadoDocumento(cmd: CambiarEstadoDocumentoCommandType): Promise<ResultType<void>> {
    const res = await this.api.put<unknown>(
      `${this.basePath}/${encodeURIComponent(cmd.vehiculoId)}/documentos/${encodeURIComponent(cmd.tipoDocumentoId)}/estado`,
      { estado: ESTADO_DOCUMENTO[cmd.estado] },
    );
    if (!res.ok) return res;
    return { ok: true, value: undefined };
  }

  async uploadDocumentos(cmd: UploadDocumentosCommandType): Promise<ResultType<UploadDocumentosResultType>> {
    const res = await this.api.post<VehiculoDtoType>(
      `${this.basePath}/${encodeURIComponent(cmd.vehiculoId)}/documentos`,
      {
        documentos: cmd.documentos.map((d) => ({
          tipoDocumentoId: d.tipoDocumentoId,
          base64: d.base64,
          nombreArchivo: d.nombreArchivo,
          fechaExpedicion: d.fechaExpedicion,
          fechaVencimiento: d.fechaVencimiento,
        })),
      },
    );
    if (!res.ok) return res;
    const cargadosRaw = val(res.value, 'cargados');
    if (!Array.isArray(cargadosRaw)) return parseErr<UploadDocumentosResultType>('Cargue inválido');
    const cargados: UploadDocumentosResultType['cargados'] = [];
    for (const raw of cargadosRaw) {
      const item = raw as Record<string, unknown>;
      const estado = estadoDocumentoFromApi(val(item, 'estado'));
      if (!estado) return parseErr<UploadDocumentosResultType>('Cargue inválido');
      cargados.push({
        tipoDocumentoId: vstr(item, 'tipoDocumentoId'),
        nombreArchivo: vstr(item, 'nombreArchivo'),
        estado,
      });
    }
    return {
      ok: true,
      value: { vehiculoId: vstr(res.value, 'vehiculoId') || cmd.vehiculoId, cargados },
    };
  }
}
