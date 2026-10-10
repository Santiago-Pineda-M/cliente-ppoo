// Estados UI - Conductores.

import type { ConductorVehiculoItemType } from '@/Domain/Entities/ConductorVehiculo';
import type { EstadoConductorType } from '@/Domain/catalogs';
import type { IPlocState } from './base.states';

export interface IConductoresState extends IPlocState {
  asociaciones: ConductorVehiculoItemType[];
  isSubmitting: boolean;
  formData: { personaId: string; vehiculoIds: string; vehiculoId: string; estado: EstadoConductorType };
}

export const initialConductoresState: IConductoresState = {
  asociaciones: [],
  isSubmitting: false,
  formData: { personaId: '', vehiculoIds: '', vehiculoId: '', estado: 'Po' },
  isLoading: false,
  errors: {},
};
