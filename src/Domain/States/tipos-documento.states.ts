// Estados UI - Catálogo de tipos de documento.

import type { TipoDocumentoItemType } from '@/Domain/Entities/TipoDocumentoEntity';
import type { IPlocState } from './base.states';

export type TipoDocumentoFormDataType = {
  codigo: string;
  nombre: string;
  tiposVehiculoAplicables: string;
  codigoObligatoriedad: string;
  descripcion: string;
};

export interface ITiposDocumentoState extends IPlocState {
  items: TipoDocumentoItemType[];
  selectedId: string | null;
  isSubmitting: boolean;
  formData: TipoDocumentoFormDataType;
}

export const initialTiposDocumentoState: ITiposDocumentoState = {
  items: [],
  selectedId: null,
  isSubmitting: false,
  formData: { codigo: '', nombre: '', tiposVehiculoAplicables: '', codigoObligatoriedad: '', descripcion: '' },
  isLoading: false,
  errors: {},
};
