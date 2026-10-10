// Estados UI - Consultas públicas.

import type {
  ConductorOperableItemType,
  DocumentoVencimientoItemType,
  PersonaConteoItemType,
} from '@/Domain/consultas';
import type { IPlocState } from './base.states';

export interface IConsultasState extends IPlocState {
  operables: ConductorOperableItemType[];
  porVencer: DocumentoVencimientoItemType[];
  vencidos: DocumentoVencimientoItemType[];
  conteo: PersonaConteoItemType[];
  dias: string;
  cantidad: string;
}

export const initialConsultasState: IConsultasState = {
  operables: [],
  porVencer: [],
  vencidos: [],
  conteo: [],
  dias: '30',
  cantidad: '50',
  isLoading: false,
  errors: {},
};
