// Barril de Application (puertos + casos de uso, sin infraestructura).
export type {
  IAuthApiService,
  LoginCommandType,
  RefreshSessionCommandType,
  LogoutCommandType,
  RevokeTokenCommandType,
  ChangePasswordCommandType,
  AuthTokenPairType,
} from './Services/IAuthApiService';
export type { IUserProfileApiService, AuthHeadersType } from './Services/IUserProfileApiService';
export type {
  IUsuariosApiService,
  ChangeUserPasswordCommandType,
  RegenerateApiKeyCommandType,
  RegeneratedApiKeyType,
} from './Services/IUsuariosApiService';
export type { IBootstrapApiService, BootstrapAdminResultType } from './Services/IBootstrapApiService';
export type {
  IPersonaApiService,
  CreatePersonaCommandType,
  CreatePersonaResultType,
  UpdatePersonaCommandType,
  UpdatePersonaResultType,
} from './Services/IPersonaApiService';
export type {
  ITipoDocumentoApiService,
  RegisterTipoDocumentoCommandType,
  UpdateTipoDocumentoCommandType,
} from './Services/ITipoDocumentoApiService';
export type {
  IVehiculoApiService,
  CreateVehiculoCommandType,
  CreateVehiculoResultType,
  UpdateVehiculoCommandType,
  UpdateVehiculoResultType,
  CambiarEstadoDocumentoCommandType,
  UploadDocumentosCommandType,
  UploadDocumentosResultType,
  UploadDocumentoItemType,
} from './Services/IVehiculoApiService';
export type {
  IConductorApiService,
  AssociateVehiculosCommandType,
  ChangeConductorEstadoCommandType,
} from './Services/IConductorApiService';
export type {
  IConsultaApiService,
  ConductorOperableItemType,
  DocumentoVencimientoItemType,
  PersonaConteoItemType,
} from './Services/IConsultaApiService';
export type { ISessionStoreService } from './Services/ISessionStoreService';
export type { IHttpTraceService } from './Services/IHttpTraceService';
export { LoginUseCase } from './UseCases/Auth/LoginUseCase';
export { RefreshSessionUseCase } from './UseCases/Auth/RefreshSessionUseCase';
export { LogoutUseCase } from './UseCases/Auth/LogoutUseCase';
export { ChangePasswordUseCase } from './UseCases/Auth/ChangePassword/ChangePasswordUseCase';
export { RevokeTokenUseCase } from './UseCases/Auth/RevokeToken/RevokeTokenUseCase';
export { GetCurrentUserUseCase } from './UseCases/Auth/CurrentUser/GetCurrentUserUseCase';
export { ChangeUserPasswordUseCase, RegenerateApiKeyUseCase } from './UseCases/Users/UsersUseCases';
export { BootstrapAdminUseCase } from './UseCases/Bootstrap/BootstrapAdminUseCase';
export { CreatePersonaUseCase, GetPersonaUseCase, UpdatePersonaUseCase } from './UseCases/Personas/PersonasUseCases';
export {
  RegisterTipoDocumentoUseCase,
  ListTiposDocumentoUseCase,
  GetTipoDocumentoUseCase,
  UpdateTipoDocumentoUseCase,
  DeleteTipoDocumentoUseCase,
} from './UseCases/TiposDocumento/TiposDocumentoUseCases';
export {
  CreateVehiculoUseCase,
  GetVehiculoByIdUseCase,
  GetVehiculoByPlacaUseCase,
  GetVehiculosByTipoUseCase,
  GetVehiculosByTipoDocumentoUseCase,
  GetVehiculosByEstadoDocumentoUseCase,
  UpdateVehiculoUseCase,
  DeleteVehiculoUseCase,
  CambiarEstadoDocumentoUseCase,
  UploadDocumentosUseCase,
} from './UseCases/Vehiculos/VehiculosUseCases';
export {
  AssociateVehiculosUseCase,
  ChangeConductorEstadoUseCase,
} from './UseCases/Conductores/ConductoresUseCases';
export {
  GetConductoresOperablesUseCase,
  GetDocumentosPorVencerUseCase,
  GetDocumentosVencidosUseCase,
  CountPersonasPorTipoUseCase,
} from './UseCases/Consultas/ConsultasUseCases';
