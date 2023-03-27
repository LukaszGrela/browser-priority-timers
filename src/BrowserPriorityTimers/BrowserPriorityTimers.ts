import { workerSource } from './web-worker/source';
import {
  IBrowserPriorityTimers,
  IClearTimerMessage,
  IFireMessage,
  ISetTimerMessage,
} from './types';

export class BrowserPriorityTimers implements IBrowserPriorityTimers {
  private static createWorker(): Worker | undefined {
    if (window && window.URL && window.Worker) {
      return new Worker(
        URL.createObjectURL(
          new Blob(['(', workerSource.toString(), ')();'], {
            type: 'application/javascript',
          })
        )
      );
    }

    return undefined;
  }
  protected worker: Worker | undefined;
  protected currentId = 0;
  protected callbacks: { [id: number]: () => void } = {};

  constructor() {
    this.worker = BrowserPriorityTimers.createWorker();
    if (this.worker) {
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }
  }

  protected nextId(): number {
    return (this.currentId += 1);
  }

  protected handleWorkerMessage(e: MessageEvent<IFireMessage>): void {
    /* istanbul ignore else */
    if (e.data.type === 'fire' && this.callbacks[e.data.id]) {
      this.callbacks[e.data.id]();
    }
  }

  public workerAvailable(): boolean {
    return !!this.worker;
  }

  setTimeout(callback: (args: void) => void, delay?: number): number;
  setTimeout<A extends unknown[]>(
    callback: (...args: A) => void,
    delay?: number,
    ...args: A
  ): number;
  setTimeout(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (...args: any[]) => void,
    delay?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): number {
    if (this.worker) {
      const timeoutId = this.nextId();
      this.callbacks[timeoutId] = () => {
        if (!args || args.length === 0) {
          callback();
        } else {
          // eslint-disable-next-line prefer-spread
          callback.apply(null, args);
        }

        delete this.callbacks[timeoutId];
      };

      const message: ISetTimerMessage = {
        type: 'setTimeout',
        id: timeoutId,
        delay,
      };

      this.worker.postMessage(message);

      return timeoutId;
    }

    return -1;
  }
  clearTimeout(id: number): void {
    /* istanbul ignore else */
    if (this.worker) {
      const message: IClearTimerMessage = {
        type: 'clearTimeout',
        id,
      };
      this.worker.postMessage(message);

      delete this.callbacks[id];
    }
  }
  setInterval(callback: (args: void) => void, delay?: number): number;
  setInterval<A extends unknown[]>(
    callback: (...args: A) => void,
    delay?: number,
    ...args: A
  ): number;
  setInterval(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (...args: any[]) => void,
    delay?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): number {
    if (this.worker) {
      const intervalId = this.nextId();

      this.callbacks[intervalId] = () => {
        if (!args || args.length === 0) {
          callback();
        } else {
          // eslint-disable-next-line prefer-spread
          callback.apply(null, args);
        }
      };

      const message: ISetTimerMessage = {
        type: 'setInterval',
        id: intervalId,
        delay,
      };

      this.worker.postMessage(message);

      return intervalId;
    }

    return -1;
  }
  clearInterval(id: number): void {
    /* istanbul ignore else */
    if (this.worker) {
      const message: IClearTimerMessage = {
        type: 'clearInterval',
        id,
      };
      this.worker.postMessage(message);

      delete this.callbacks[id];
    }
  }
}
