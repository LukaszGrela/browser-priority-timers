import type {
  ISetTimerMessage,
  IClearTimerMessage,
  IFireMessage,
} from '../types';

type TIntervalDictionary = {
  [key: number]: NodeJS.Timer;
};

export function workerSource(): void {
  const idMap: TIntervalDictionary = {};

  self.onmessage = function onmessageHandler(
    e: MessageEvent<ISetTimerMessage | IClearTimerMessage>
  ) {
    switch (e.data.type) {
      case 'setInterval':
        idMap[e.data.id] = setInterval(function setIntervalCallback() {
          const message: IFireMessage = {
            type: 'fire',
            id: e.data.id,
          };
          self.postMessage(message);
        }, e.data.delay);
        break;
      case 'clearInterval':
        clearInterval(idMap[e.data.id]);
        delete idMap[e.data.id];
        break;
      case 'setTimeout':
        idMap[e.data.id] = setTimeout(function setTimeoutCallback() {
          const message: IFireMessage = {
            type: 'fire',
            id: e.data.id,
          };
          self.postMessage(message);

          delete idMap[e.data.id];
        }, e.data.delay);
        break;
      case 'clearTimeout':
        clearTimeout(idMap[e.data.id]);
        delete idMap[e.data.id];
        break;
    }
  };
}
