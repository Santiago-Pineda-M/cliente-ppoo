// Items de consultas públicas (/consultas). DTOs planos con fechas ISO.

import type { EstadoDocumentoType, TipoPersonaType } from '@/Domain/catalogs';

export type ConductorOperableItemType = {
  personaId: string;
  nombres: string;
  apellidos: string;
  vehiculoId: string;
};

export type DocumentoVencimientoItemType = {
  vehiculoId: string;
  tipoDocumentoId: string;
  fechaVencimiento: string;
  estado: EstadoDocumentoType;
};

export type PersonaConteoItemType = {
  tipo: TipoPersonaType;
  cantidad: number;
};
