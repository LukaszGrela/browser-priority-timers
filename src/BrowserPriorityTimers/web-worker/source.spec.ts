import type { IClearTimerMessage, ISetTimerMessage } from '../types';
import { workerSource } from './source';

describe('BrowserPriorityTimers', () => {
  describe('web-worker', () => {
    let windowSpy: jest.SpyInstance;
    const mockPostMessage = jest.fn();

    beforeEach(() => {
      jest.useFakeTimers({
        legacyFakeTimers: true,
      });

      // customise self alias
      windowSpy = jest.spyOn(window, 'self', 'get');
      const mockImplementation = {
        postMessage: mockPostMessage,
      };
      Object.defineProperty(mockImplementation, 'onmessage', {
        get() {
          return this._onmessage;
        },
        set(f) {
          this._onmessage = f;
        },
      });

      windowSpy.mockImplementation(() => mockImplementation);

      self.onmessage = null;
    });

    afterEach(() => {
      windowSpy.mockRestore();
      mockPostMessage.mockClear();

      jest.clearAllTimers();
      jest.useRealTimers();
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('responds to setTimeout message', () => {
      workerSource();
      const id = 1;
      const message: ISetTimerMessage = {
        type: 'setTimeout',
        id,
        delay: 50,
      };

      self.onmessage?.(new MessageEvent('onmessage', { data: message }));

      jest.advanceTimersByTime(100);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenLastCalledWith({
        id,
        type: 'fire',
      });
    });

    it('responds to clearTimeout message', () => {
      workerSource();
      const id = 1;
      const messageSet: ISetTimerMessage = {
        type: 'setTimeout',
        id,
        delay: 200,
      };

      const eventSet: MessageEvent<ISetTimerMessage> = new MessageEvent(
        'onmessage',
        { data: messageSet }
      );

      self.onmessage?.(eventSet);
      jest.advanceTimersByTime(50);

      const message: IClearTimerMessage = {
        type: 'clearTimeout',
        id,
      };
      const event: MessageEvent<IClearTimerMessage> = new MessageEvent(
        'onmessage',
        {
          data: message,
        }
      );

      self.onmessage?.(event);
      jest.advanceTimersByTime(200);

      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it('responds to setInterval message', () => {
      workerSource();
      const id = 3;
      const times = 2;
      const delay = 50;
      const message: ISetTimerMessage = {
        type: 'setInterval',
        id,
        delay,
      };

      self.onmessage?.(new MessageEvent('onmessage', { data: message }));

      jest.advanceTimersByTime(times * delay);

      expect(mockPostMessage).toHaveBeenCalledTimes(times);
      expect(mockPostMessage).toHaveBeenLastCalledWith({
        id,
        type: 'fire',
      });
    });

    it('responds to clearInterval message', () => {
      workerSource();
      const id = 4;
      const delay = 100;
      const messageSet: ISetTimerMessage = {
        type: 'setInterval',
        id,
        delay,
      };

      self.onmessage?.(new MessageEvent('onmessage', { data: messageSet }));

      jest.advanceTimersByTime(50);

      const message: IClearTimerMessage = {
        type: 'clearInterval',
        id,
      };
      const event: MessageEvent<IClearTimerMessage> = new MessageEvent(
        'onmessage',
        {
          data: message,
        }
      );

      self.onmessage?.(event);
      jest.advanceTimersByTime(200);

      expect(mockPostMessage).not.toHaveBeenCalled();
    });
  });
});
