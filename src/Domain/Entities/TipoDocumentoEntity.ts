// Entidad TipoDocumento: catálogo paramétrico de /tipos-documento.

import type { ApiErrorType, ResultType } from '@/Domain/IPatterns';

export type TipoDocumentoPropsType = {
  id: string;
  codigo: string;
  nombre: string;
  tiposVehiculoAplicables: string;
  codigoObligatoriedad: string;
  descripcion: string;
};

export type TipoDocumentoItemType = TipoDocumentoPropsType;

function err(message: string): ResultType<never, ApiErrorType> {
  return { ok: false, error: { kind: 'parse', message } };
}

export class TipoDocumentoEntity {
  private constructor(private readonly props: TipoDocumentoPropsType) {}

  static create(props: TipoDocumentoPropsType): ResultType<TipoDocumentoEntity> {
    if (!props.id?.trim()) return err('Id de tipo de documento requerido');
    if (!props.codigo?.trim()) return err('Código requerido');
    if (!props.nombre?.trim()) return err('Nombre requerido');
    if (!props.tiposVehiculoAplicables?.trim()) return err('Tipos de vehículo aplicables requeridos');
    if (!props.codigoObligatoriedad?.trim()) return err('Código de obligatoriedad requerido');
    if (!props.descripcion?.trim()) return err('Descripción requerida');
    return { ok: true, value: new TipoDocumentoEntity({ ...props }) };
  }

  static fromPersistence(data: Record<string, unknown>): ResultType<TipoDocumentoEntity> {
    return TipoDocumentoEntity.create({
      id: String(data.id ?? ''),
      codigo: String(data.codigo ?? ''),
      nombre: String(data.nombre ?? ''),
      tiposVehiculoAplicables: String(data.tiposVehiculoAplicables ?? ''),
      codigoObligatoriedad: String(data.codigoObligatoriedad ?? ''),
      descripcion: String(data.descripcion ?? ''),
    });
  }

  get id(): string {
    return this.props.id;
  }

  toProps(): TipoDocumentoPropsType {
    return { ...this.props };
  }

  toItem(): TipoDocumentoItemType {
    return { ...this.props };
  }
}
