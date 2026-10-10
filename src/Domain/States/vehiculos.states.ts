// Estados UI - Vehículos.

import type { VehiculoItemType, VehiculoResumenItemType } from '@/Domain/Entities/VehiculoEntity';
import type {
  EstadoDocumentoType,
  TipoCombustibleType,
  TipoServicioType,
  TipoVehiculoType,
} from '@/Domain/catalogs';
import type { IPlocState } from './base.states';

export type VehiculoFormDataType = {
  placa: string;
  tipoVehiculo: TipoVehiculoType;
  tipoServicio: TipoServicioType;
  tipoCombustible: TipoCombustibleType;
  capacidadPasajeros: string;
  color: string;
  modelo: string;
  marca: string;
  linea: string;
  tipoDocumentoId: string;
  documentoBase64: string;
  nombreArchivo: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
};

export interface IVehiculosState extends IPlocState {
  vehiculo: VehiculoItemType | null;
  resumenes: VehiculoResumenItemType[];
  isSubmitting: boolean;
  formData: VehiculoFormDataType;
  filtroEstado: EstadoDocumentoType | null;
}

export const initialVehiculosState: IVehiculosState = {
  vehiculo: null,
  resumenes: [],
  isSubmitting: false,
  formData: {
    placa: '',
    tipoVehiculo: 'Automovil',
    tipoServicio: 'Publico',
    tipoCombustible: 'Gasolina',
    capacidadPasajeros: '',
    color: '',
    modelo: '',
    marca: '',
    linea: '',
    tipoDocumentoId: '',
    documentoBase64: '',
    nombreArchivo: '',
    fechaExpedicion: '',
    fechaVencimiento: '',
  },
  filtroEstado: null,
  isLoading: false,
  errors: {},
};
