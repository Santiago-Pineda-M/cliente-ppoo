// Contrato del contenedor DI. Se amplía por entidad (sin negocio salvo transversal).
import type { AuthPloc } from '@/Controllers/Auth/AuthPloc';
import type { UsersPloc } from '@/Controllers/Users/UsersPloc';
import type { PersonaDetailPloc } from '@/Controllers/Personas/PersonaDetailPloc';
import type { TipoDocumentoListPloc } from '@/Controllers/TiposDocumento/TipoDocumentoListPloc';
import type { VehiculoDetailPloc } from '@/Controllers/Vehiculos/VehiculoDetailPloc';
import type { ConductorPloc } from '@/Controllers/Conductores/ConductorPloc';
import type { ConsultasPloc } from '@/Controllers/Consultas/ConsultasPloc';
import type { HttpTraceListPloc } from '@/Controllers/HttpTrace/HttpTraceListPloc';
import type { AppConfigType } from './modules/config.module';
import { getAuthPloc } from './modules/auth.module';
import { getUsersPloc } from './modules/users.module';
import { getPersonaDetailPloc } from './modules/personas.module';
import { getTipoDocumentoListPloc } from './modules/tipos-documento.module';
import { getVehiculoDetailPloc } from './modules/vehiculos.module';
import { getConductorPloc } from './modules/conductores.module';
import { getConsultasPloc } from './modules/consultas.module';
import { getHttpTraceListPloc } from './modules/http-trace.module';
import { getAppConfig } from './modules/config.module';

export interface IDependencies {
  appConfig: AppConfigType;
  authPloc: AuthPloc;
  usersPloc: UsersPloc;
  personaDetailPloc: PersonaDetailPloc;
  tipoDocumentoListPloc: TipoDocumentoListPloc;
  vehiculoDetailPloc: VehiculoDetailPloc;
  conductorPloc: ConductorPloc;
  consultasPloc: ConsultasPloc;
  httpTraceListPloc: HttpTraceListPloc;
}

export const dependenciesLocator: IDependencies = {
  get appConfig() {
    return getAppConfig();
  },
  get authPloc() {
    return getAuthPloc();
  },
  get usersPloc() {
    return getUsersPloc();
  },
  get personaDetailPloc() {
    return getPersonaDetailPloc();
  },
  get tipoDocumentoListPloc() {
    return getTipoDocumentoListPloc();
  },
  get vehiculoDetailPloc() {
    return getVehiculoDetailPloc();
  },
  get conductorPloc() {
    return getConductorPloc();
  },
  get consultasPloc() {
    return getConsultasPloc();
  },
  get httpTraceListPloc() {
    return getHttpTraceListPloc();
  },
};
