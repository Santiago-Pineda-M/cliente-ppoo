// Port de datos remotos: catálogo de tipos de documento (/tipos-documento).
// Requiere JWT + X-Api-Key. Ruta en Infrastructure/Api/TiposDocumento/.

import type { ResultType } from '@/Domain';
import type { TipoDocumentoEntity } from '@/Domain/Entities/TipoDocumentoEntity';

export type RegisterTipoDocumentoCommandType = {
  codigo: string;
  nombre: string;
  tiposVehiculoAplicables: string;
  codigoObligatoriedad: string;
  descripcion: string;
};

export type UpdateTipoDocumentoCommandType = {
  id: string;
  nombre: string;
  tiposVehiculoAplicables: string;
  codigoObligatoriedad: string;
  descripcion: string;
};

export interface ITipoDocumentoApiService {
  register(cmd: RegisterTipoDocumentoCommandType): Promise<ResultType<TipoDocumentoEntity>>;
  list(): Promise<ResultType<TipoDocumentoEntity[]>>;
  getById(id: string): Promise<ResultType<TipoDocumentoEntity | null>>;
  update(cmd: UpdateTipoDocumentoCommandType): Promise<ResultType<TipoDocumentoEntity>>;
  remove(id: string): Promise<ResultType<void>>;
}
