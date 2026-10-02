import {
  Ploc,
  initialHttpTraceListState,
  type IHttpTraceListState,
} from '@/Domain';
import type { IHttpTraceService } from '@/Application';

export class HttpTraceListPloc extends Ploc<IHttpTraceListState> {
  private detach: (() => void) | null = null;

  constructor(private readonly traceService: IHttpTraceService) {
    super(initialHttpTraceListState);
  }

  // Suscribe el acumulador; llamar una vez (montaje del layout).
  attach(): void {
    if (this.detach) return;
    this.changeState({ ...this.state, traces: this.traceService.getAll() });
    this.detach = this.traceService.subscribe((traces) => {
      this.changeState({ ...this.state, traces });
    });
  }

  detachService(): void {
    this.detach?.();
    this.detach = null;
  }

  toggle(): void {
    this.changeState({ ...this.state, isOpen: !this.state.isOpen });
  }

  select(id: string | null): void {
    this.changeState({ ...this.state, selectedId: id });
  }

  clear(): void {
    this.traceService.clear();
    this.changeState({ ...this.state, selectedId: null });
  }

  reset(): void {
    this.detachService();
    this.changeState(initialHttpTraceListState);
  }
}
