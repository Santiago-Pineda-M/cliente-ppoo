// Entidad Persona: refleja Create/Get/Update de /personas.
// Enums como string unions (ver catalogs.ts); fechas ISO en items.

import type { ApiErrorType, ResultType } from '@/Domain/IPatterns';
import type { TipoIdentificacionType, TipoPersonaType } from '@/Domain/catalogs';

export type PersonaPropsType = {
  id: string;
  tipoIdentificacion: TipoIdentificacionType;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  tipoPersona: TipoPersonaType;
  login: string | null;
  tieneUsuario: boolean;
};

export type PersonaItemType = {
  id: string;
  tipoIdentificacion: TipoIdentificacionType;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  tipoPersona: TipoPersonaType;
  login: string | null;
  tieneUsuario: boolean;
};

function err(message: string): ResultType<never, ApiErrorType> {
  return { ok: false, error: { kind: 'parse', message } };
}

export class PersonaEntity {
  private constructor(private readonly props: PersonaPropsType) {}

  static create(props: PersonaPropsType): ResultType<PersonaEntity> {
    if (!props.id?.trim()) return err('Id de persona requerido');
    if (!props.numeroIdentificacion?.trim()) return err('Número de identificación requerido');
    if (!props.nombres?.trim()) return err('Nombres requeridos');
    if (!props.apellidos?.trim()) return err('Apellidos requeridos');
    if (!props.correoElectronico?.trim()) return err('Correo electrónico requerido');
    return { ok: true, value: new PersonaEntity({ ...props, login: props.login ?? null }) };
  }

  static fromPersistence(data: Record<string, unknown>): ResultType<PersonaEntity> {
    const tipoPersona = data.tipoPersona;
    const tipoIdentificacion = data.tipoIdentificacion;
    if (tipoPersona !== 'Administrativo' && tipoPersona !== 'Conductor') {
      return err('Tipo de persona inválido');
    }
    if (
      tipoIdentificacion !== 'CedulaCiudadania' &&
      tipoIdentificacion !== 'CedulaExtranjeria' &&
      tipoIdentificacion !== 'TarjetaIdentidad' &&
      tipoIdentificacion !== 'Nit'
    ) {
      return err('Tipo de identificación inválido');
    }
    return PersonaEntity.create({
      id: String(data.id ?? ''),
      tipoIdentificacion,
      numeroIdentificacion: String(data.numeroIdentificacion ?? ''),
      nombres: String(data.nombres ?? ''),
      apellidos: String(data.apellidos ?? ''),
      correoElectronico: String(data.correoElectronico ?? ''),
      tipoPersona,
      login: typeof data.login === 'string' ? data.login : null,
      tieneUsuario: data.tieneUsuario === true,
    });
  }

  get id(): string {
    return this.props.id;
  }

  toProps(): PersonaPropsType {
    return { ...this.props };
  }

  toItem(): PersonaItemType {
    return { ...this.props };
  }
}
