// Estados UI - Trazas HTTP (drawer lateral de peticiones).

import type { IPlocState } from './base.states';

export type HttpTraceType = {
  id: string;
  method: string;
  url: string;
  reqHeaders: Record<string, string>;
  reqBody: unknown;
  status?: number;
  resBody: unknown;
  ms: number;
  at: string;
  ok: boolean;
};

// Lo que emite ApiClient; el servicio asigna el id.
export type HttpTraceInputType = {
  method: string;
  url: string;
  reqHeaders: Record<string, string>;
  reqBody: unknown;
  status?: number;
  resBody: unknown;
  ms: number;
  at: string;
  ok: boolean;
};

export type TraceSinkType = (input: HttpTraceInputType) => void;

export interface IHttpTraceListState extends IPlocState {
  isOpen: boolean;
  traces: HttpTraceType[];
  selectedId: string | null;
}

export const initialHttpTraceListState: IHttpTraceListState = {
  isOpen: false,
  traces: [],
  selectedId: null,
  isLoading: false,
  errors: {},
};
