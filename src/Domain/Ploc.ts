type SubscriptionType<S> = (state: S) => void;

export abstract class Ploc<S> {
  private internalState: S;
  private listeners: SubscriptionType<S>[] = [];

  constructor(initialState: S) {
    this.internalState = initialState;
  }

  public get state(): S {
    return this.internalState;
  }

  changeState(state: S): void {
    this.internalState = state;
    if (this.listeners.length > 0) {
      this.listeners.forEach((listener) => listener(this.state));
    }
  }

  subscribe(listener: SubscriptionType<S>): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: SubscriptionType<S>): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}
