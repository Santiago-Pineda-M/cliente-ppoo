// Estados UI - Personas.

import type { PersonaItemType } from '@/Domain/Entities/PersonaEntity';
import type { TipoIdentificacionType, TipoPersonaType } from '@/Domain/catalogs';
import type { IPlocState } from './base.states';

export type PersonaFormDataType = {
  tipoIdentificacion: TipoIdentificacionType;
  numeroIdentificacion: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  tipoPersona: TipoPersonaType;
};

export interface IPersonaState extends IPlocState {
  persona: PersonaItemType | null;
  createdCredentials: { login: string; apiKey: string; passwordGenerada: string } | null;
  isSubmitting: boolean;
  formData: PersonaFormDataType;
}

export const initialPersonaState: IPersonaState = {
  persona: null,
  createdCredentials: null,
  isSubmitting: false,
  formData: {
    tipoIdentificacion: 'CedulaCiudadania',
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    correoElectronico: '',
    tipoPersona: 'Conductor',
  },
  isLoading: false,
  errors: {},
};
