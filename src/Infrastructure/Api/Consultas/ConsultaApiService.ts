// Servicio API de consultas públicas (sin auth). Dueño de la ruta (basePath único).
// La API habla camelCase con enums numéricos: el mapeo vive solo aquí.

import type { ResultType } from '@/Domain';
import {
  estadoDocumentoFromApi,
  tipoPersonaFromApi,
} from '@/Domain/catalogs';
import type {
  ConductorOperableItemType,
  DocumentoVencimientoItemType,
  IConsultaApiService,
  PersonaConteoItemType,
} from '@/Application/Services/IConsultaApiService';
import type { ApiClient } from '@/Infrastructure/Api/ApiClient';
import { parseErr, val, vstr } from '@/Infrastructure/Api/api-helpers';

export class ConsultaApiService implements IConsultaApiService {
  constructor(
    private readonly api: ApiClient,
    private readonly basePath = '/consultas',
  ) {}

  async conductoresOperables(cantidad = 50): Promise<ResultType<ConductorOperableItemType[]>> {
    const res = await this.api.get<Record<string, unknown>[]>(
      `${this.basePath}/conductores-operables?cantidad=${cantidad}`,
      { auth: false },
    );
    if (!res.ok) return res;
    return {
      ok: true,
      value: res.value.map((d) => ({
        personaId: vstr(d, 'personaId'),
        nombres: vstr(d, 'nombres'),
        apellidos: vstr(d, 'apellidos'),
        vehiculoId: vstr(d, 'vehiculoId'),
      })),
    };
  }

  private async vencimientos(path: string): Promise<ResultType<DocumentoVencimientoItemType[]>> {
    const res = await this.api.get<Record<string, unknown>[]>(path, { auth: false });
    if (!res.ok) return res;
    const out: DocumentoVencimientoItemType[] = [];
    for (const d of res.value) {
      const estado = estadoDocumentoFromApi(val(d, 'estado'));
      if (!estado) return parseErr<DocumentoVencimientoItemType[]>('Vencimiento inválido');
      out.push({
        vehiculoId: vstr(d, 'vehiculoId'),
        tipoDocumentoId: vstr(d, 'tipoDocumentoId'),
        fechaVencimiento: vstr(d, 'fechaVencimiento'),
        estado,
      });
    }
    return { ok: true, value: out };
  }

  documentosPorVencer(dias: number): Promise<ResultType<DocumentoVencimientoItemType[]>> {
    return this.vencimientos(`${this.basePath}/documentos-por-vencer?dias=${dias}`);
  }

  documentosVencidos(): Promise<ResultType<DocumentoVencimientoItemType[]>> {
    return this.vencimientos(`${this.basePath}/documentos-vencidos`);
  }

  async personasPorTipo(): Promise<ResultType<PersonaConteoItemType[]>> {
    const res = await this.api.get<Record<string, unknown>[]>(`${this.basePath}/personas-por-tipo`, { auth: false });
    if (!res.ok) return res;
    const out: PersonaConteoItemType[] = [];
    for (const d of res.value) {
      const tipo = tipoPersonaFromApi(val(d, 'tipo'));
      if (!tipo) return parseErr<PersonaConteoItemType[]>('Conteo inválido');
      const cantidad = val(d, 'cantidad');
      out.push({ tipo, cantidad: typeof cantidad === 'number' ? cantidad : 0 });
    }
    return { ok: true, value: out };
  }
}
