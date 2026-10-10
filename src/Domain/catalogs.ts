// Catálogos de la API: los enums de C# viajan como número en JSON.
// En Domain se usan uniones string; la conversión número<->string vive aquí
// (borde puro, sin imports). Infrastructure convierte al enviar/recibir.

export const TIPO_PERSONA = { Administrativo: 1, Conductor: 2 } as const;
export type TipoPersonaType = keyof typeof TIPO_PERSONA;

export const TIPO_IDENTIFICACION = {
  CedulaCiudadania: 1,
  CedulaExtranjeria: 2,
  TarjetaIdentidad: 3,
  Nit: 4,
} as const;
export type TipoIdentificacionType = keyof typeof TIPO_IDENTIFICACION;

export const TIPO_VEHICULO = { Automovil: 1, Motocicleta: 2 } as const;
export type TipoVehiculoType = keyof typeof TIPO_VEHICULO;

export const TIPO_SERVICIO = { Publico: 1, Privado: 2 } as const;
export type TipoServicioType = keyof typeof TIPO_SERVICIO;

export const TIPO_COMBUSTIBLE = { Gasolina: 1, Gas: 2, Disel: 3 } as const;
export type TipoCombustibleType = keyof typeof TIPO_COMBUSTIBLE;

export const ESTADO_DOCUMENTO = { Habilitado: 1, Vencido: 2, EnVerificacion: 3 } as const;
export type EstadoDocumentoType = keyof typeof ESTADO_DOCUMENTO;

export const ESTADO_CONDUCTOR = { Po: 1, Ea: 2, Ro: 3 } as const;
export type EstadoConductorType = keyof typeof ESTADO_CONDUCTOR;

// El rol viaja como string ("Member"/"Administrator") en CurrentUserOutputDto.
export const USER_ROLE = { Member: 'Member', Administrator: 'Administrator' } as const;
export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE];

function reverse<T extends string>(catalog: Record<T, number>, value: unknown): T | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  for (const key of Object.keys(catalog) as T[]) {
    if (catalog[key] === value) return key;
  }
  return null;
}

export function tipoPersonaFromApi(value: unknown): TipoPersonaType | null {
  return reverse(TIPO_PERSONA, value);
}

export function tipoIdentificacionFromApi(value: unknown): TipoIdentificacionType | null {
  return reverse(TIPO_IDENTIFICACION, value);
}

export function tipoVehiculoFromApi(value: unknown): TipoVehiculoType | null {
  return reverse(TIPO_VEHICULO, value);
}

export function tipoServicioFromApi(value: unknown): TipoServicioType | null {
  return reverse(TIPO_SERVICIO, value);
}

export function tipoCombustibleFromApi(value: unknown): TipoCombustibleType | null {
  return reverse(TIPO_COMBUSTIBLE, value);
}

export function estadoDocumentoFromApi(value: unknown): EstadoDocumentoType | null {
  return reverse(ESTADO_DOCUMENTO, value);
}

export function estadoConductorFromApi(value: unknown): EstadoConductorType | null {
  return reverse(ESTADO_CONDUCTOR, value);
}
