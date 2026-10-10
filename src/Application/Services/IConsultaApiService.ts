// Port de datos remotos: consultas públicas (/consultas, sin auth).
// Ruta en Infrastructure/Api/Consultas/.

import type { ResultType } from '@/Domain';
import type {
  ConductorOperableItemType,
  DocumentoVencimientoItemType,
  PersonaConteoItemType,
} from '@/Domain/consultas';

export type {
  ConductorOperableItemType,
  DocumentoVencimientoItemType,
  PersonaConteoItemType,
} from '@/Domain/consultas';

export interface IConsultaApiService {
  conductoresOperables(cantidad?: number): Promise<ResultType<ConductorOperableItemType[]>>;
  documentosPorVencer(dias: number): Promise<ResultType<DocumentoVencimientoItemType[]>>;
  documentosVencidos(): Promise<ResultType<DocumentoVencimientoItemType[]>>;
  personasPorTipo(): Promise<ResultType<PersonaConteoItemType[]>>;
}
