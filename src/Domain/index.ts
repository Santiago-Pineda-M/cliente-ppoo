// Barril del Domain. Solo base genérica + transversal (sin negocio).
export { Ploc } from './Ploc';
export type { IUseCase, ResultType, ApiErrorType } from './IPatterns';
export * from './States';
export * from './catalogs';
export * from './account';
export * from './consultas';
export { SessionEntity } from './Entities/SessionEntity';
export type { SessionPropsType, SessionItemType, SessionUserType } from './Entities/SessionEntity';
export { PersonaEntity } from './Entities/PersonaEntity';
export type { PersonaPropsType, PersonaItemType } from './Entities/PersonaEntity';
export { TipoDocumentoEntity } from './Entities/TipoDocumentoEntity';
export type { TipoDocumentoPropsType, TipoDocumentoItemType } from './Entities/TipoDocumentoEntity';
export { VehiculoEntity } from './Entities/VehiculoEntity';
export type {
  VehiculoPropsType,
  VehiculoItemType,
  VehiculoResumenItemType,
  VehiculoDocumentoType,
  VehiculoConductorType,
} from './Entities/VehiculoEntity';
export { conductorVehiculoFromPersistence } from './Entities/ConductorVehiculo';
export type { ConductorVehiculoItemType } from './Entities/ConductorVehiculo';
