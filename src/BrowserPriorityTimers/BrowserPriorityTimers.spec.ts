import { BrowserPriorityTimers } from './BrowserPriorityTimers';
import { IFireMessage, TPriorityTimersMessage } from './types';

describe('BrowserPriorityTimers', () => {
  let mockPostMessage = jest.fn();
  let mockOnMessage = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });

    mockPostMessage = jest.fn();
    mockOnMessage = jest.fn();

    window.URL = {
      prototype: {} as URL,
      createObjectURL: jest.fn(),
      revokeObjectURL: jest.fn(),
    } as unknown as typeof window.URL;

    const workerImplementation = {
      $onmessage: jest.fn(),
      onmessage: jest.fn(),
      postMessage(message: TPriorityTimersMessage) {
        mockPostMessage(message);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const me = this as any;
        if (me && me.$onmessage) {
          const messageOut: IFireMessage = {
            id: message.id,
            type: 'fire',
          };
          console.log('mocked worker impl', messageOut);
          me.$onmessage({ data: messageOut });
        }
      },
      onmessageerror: jest.fn(),
      terminate: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      onerror: jest.fn(),
    };

    Object.defineProperty(workerImplementation, 'onmessage', {
      get() {
        return (...args: unknown[]) => {
          // eslint-disable-next-line prefer-spread
          mockOnMessage.apply(null, args);
          this.$onmessage.apply(null, args);
        };
      },
      set(f) {
        this.$onmessage = f;
      },
    });

    window.Worker = jest.fn(() => {
      return workerImplementation;
    });
  });

  afterEach(() => {
    window.URL = undefined;
    window.Worker = undefined;

    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('Worker not supported', () => {
    window.URL = undefined;
    window.Worker = undefined;

    const timers = new BrowserPriorityTimers();

    expect(timers.setInterval(jest.fn())).toEqual(-1);
    expect(timers.setTimeout(jest.fn())).toEqual(-1);
    expect(timers.workerAvailable()).toBeFalsy();
  });

  it('Worker supported', () => {
    const timers = new BrowserPriorityTimers();
    expect(timers.workerAvailable()).toBeTruthy();
  });

  it('calls setInterval', () => {
    const timers = new BrowserPriorityTimers();
    const callback = jest.fn();

    timers.setInterval(callback, 10);
    expect(callback).toBeCalled();

    // with arguments
    timers.setInterval(callback, 10, 1, 2, 3);
    expect(callback).toHaveBeenLastCalledWith(1, 2, 3);
  });

  it('calls clearInterval', () => {
    const timers = new BrowserPriorityTimers();
    const callback = jest.fn();

    const id = timers.setInterval(callback, 10);
    expect(callback).toBeCalled();

    timers.clearInterval(id);
    expect(mockPostMessage).toHaveBeenLastCalledWith({
      type: 'clearInterval',
      id,
    });
  });

  it('calls setTimeout', () => {
    const timers = new BrowserPriorityTimers();
    const callback = jest.fn();

    timers.setTimeout(callback, 10);
    expect(callback).toBeCalled();

    // with arguments
    timers.setTimeout(callback, 10, 1, 2, 3);
    expect(callback).toHaveBeenLastCalledWith(1, 2, 3);
  });

  it('calls clearTimeout', () => {
    const timers = new BrowserPriorityTimers();
    const callback = jest.fn();

    const id = timers.setInterval(callback, 10);
    expect(callback).toBeCalled();

    timers.clearTimeout(id);
    expect(mockPostMessage).toHaveBeenLastCalledWith({
      type: 'clearTimeout',
      id,
    });
  });
});
