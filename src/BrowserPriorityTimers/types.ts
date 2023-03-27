export interface IBrowserPriorityTimers {
  // BrowserPriorityTimers API
  /**
   * Will return true when Worker functionality is available.
   */
  workerAvailable(): boolean;
  // timers API (setTimeout, clearTimeout, setInterval, clearInterval)

  setTimeout(callback: (args: void) => void, delay?: number): number;
  setTimeout<A extends unknown[]>(
    callback: (...args: A) => void,
    delay?: number,
    ...args: A
  ): number;
  clearTimeout(id: number): void;

  setInterval(callback: (args: void) => void, delay?: number): number;
  setInterval<A extends unknown[]>(
    callback: (...args: A) => void,
    delay?: number,
    ...args: A
  ): number;
  clearInterval(id: number): void;
}

export interface IMessage {
  type: string;
  id: number;
}

export interface IFireMessage extends IMessage {
  type: 'fire';
}

export interface IClearTimerMessage extends IMessage {
  type: 'clearInterval' | 'clearTimeout';
}

export interface ISetTimerMessage extends IMessage {
  type: 'setInterval' | 'setTimeout';
  /**
   * Optional timer delay
   */
  delay?: number;
}
export type TPriorityTimersMessage =
  | IFireMessage
  | IClearTimerMessage
  | ISetTimerMessage;
