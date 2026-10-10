// Port de datos remotos: recurso vehículos (/vehiculos).
// Lectura por placa pública; el resto requiere JWT + X-Api-Key.
// Ruta en Infrastructure/Api/Vehiculos/.

import type { ResultType } from '@/Domain';
import type { VehiculoEntity, VehiculoResumenItemType } from '@/Domain/Entities/VehiculoEntity';
import type {
  EstadoDocumentoType,
  TipoCombustibleType,
  TipoServicioType,
  TipoVehiculoType,
} from '@/Domain/catalogs';

export type CreateVehiculoCommandType = {
  placa: string;
  tipoVehiculo: TipoVehiculoType;
  tipoServicio: TipoServicioType;
  tipoCombustible: TipoCombustibleType;
  capacidadPasajeros: number;
  color: string;
  modelo: number;
  marca: string;
  linea: string;
  tipoDocumentoId: string;
  documentoBase64: string;
  nombreArchivo: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
};

export type CreateVehiculoResultType = {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculoType;
  tipoServicio: TipoServicioType;
  tipoCombustible: TipoCombustibleType;
  capacidadPasajeros: number;
  color: string;
  modelo: number;
  marca: string;
  linea: string;
  tipoDocumentoId: string;
  nombreArchivo: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  estado: EstadoDocumentoType;
};

export type UpdateVehiculoCommandType = {
  id: string;
  placa: string;
  tipoVehiculo: TipoVehiculoType;
  tipoServicio: TipoServicioType;
  tipoCombustible: TipoCombustibleType;
  capacidadPasajeros: number;
  color: string;
  modelo: number;
  marca: string;
  linea: string;
};

export type UpdateVehiculoResultType = UpdateVehiculoCommandType & { updatedAt: string | null };

export type CambiarEstadoDocumentoCommandType = {
  vehiculoId: string;
  tipoDocumentoId: string;
  estado: EstadoDocumentoType;
};

export type UploadDocumentoItemType = {
  tipoDocumentoId: string;
  base64: string;
  nombreArchivo: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
};

export type UploadDocumentosCommandType = {
  vehiculoId: string;
  documentos: UploadDocumentoItemType[];
};

export type UploadDocumentosResultType = {
  vehiculoId: string;
  cargados: { tipoDocumentoId: string; nombreArchivo: string; estado: EstadoDocumentoType }[];
};

export interface IVehiculoApiService {
  getByPlaca(placa: string): Promise<ResultType<VehiculoEntity | null>>;
  getById(id: string): Promise<ResultType<VehiculoEntity | null>>;
  getByTipo(tipo: TipoVehiculoType): Promise<ResultType<VehiculoResumenItemType[]>>;
  getByTipoDocumento(codigo: string): Promise<ResultType<VehiculoResumenItemType[]>>;
  getByEstadoDocumento(estado: EstadoDocumentoType): Promise<ResultType<VehiculoResumenItemType[]>>;
  create(cmd: CreateVehiculoCommandType): Promise<ResultType<CreateVehiculoResultType>>;
  update(cmd: UpdateVehiculoCommandType): Promise<ResultType<UpdateVehiculoResultType>>;
  remove(id: string): Promise<ResultType<void>>;
  cambiarEstadoDocumento(cmd: CambiarEstadoDocumentoCommandType): Promise<ResultType<void>>;
  uploadDocumentos(cmd: UploadDocumentosCommandType): Promise<ResultType<UploadDocumentosResultType>>;
}
