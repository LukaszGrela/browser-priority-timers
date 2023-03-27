import {
  BrowserPriorityTimers,
  IBrowserPriorityTimers,
} from '../BrowserPriorityTimers';

const priorityTimers: IBrowserPriorityTimers = new BrowserPriorityTimers();
const SECOND = 1000;

type TStatus = 'ON' | 'OFF';
let timerId: number | NodeJS.Timer = -1;
let date: number = 0;
let counter = 0;
let maxDiff = 0;

function updateTimer(timerNode: HTMLParagraphElement): void {
  const diff = date === 0 ? 0 : new Date().getTime() - date;

  maxDiff = Math.max(maxDiff, diff);
  timerNode.innerHTML = `${counter++} - ${(diff / 1000).toPrecision(
    3
  )}s max: ${(maxDiff / 1000).toPrecision(3)}`;
}

const tick = (timerNode: HTMLParagraphElement): void => {
  updateTimer(timerNode);
  date = new Date().getTime();
};

function switchTimers(status: TStatus, timerNode: HTMLParagraphElement): void {
  counter = 0;
  date = 0;
  maxDiff = 0;
  if (status === 'OFF') {
    //
    priorityTimers.clearInterval(timerId);
    // use normal timers
    timerId = setInterval(tick, SECOND, timerNode);
  } else {
    //
    clearInterval(timerId);
    // use priority timers
    timerId = priorityTimers.setInterval(tick, SECOND, timerNode);
  }
}

export function example(node: HTMLElement): void {
  let timerNode: HTMLParagraphElement;
  let buttonLabelNode: HTMLSpanElement;
  let status: TStatus = 'ON';
  const toggle = () => {
    if (status === 'ON') {
      status = 'OFF';
    } else {
      status = 'ON';
    }
    // update
    buttonLabelNode.innerHTML = `${status}`;

    switchTimers(status, timerNode);
  };

  if (node) {
    node.innerHTML = `
            <p>Switch to another tab, or minimise browser, then come back after some time to see the difference in timer.</p>
            <p>The longer you wait the longer the difference as built in timers are throttled.</p>
            <p>Priority timers are working on Workers so will not be throttled</p>
            <p id="timer"></p>
            <button id="toggle-timers">Turn priority timers: <span id="status">ON</span</button>
        `;

    const btn = node.querySelector('#toggle-timers')!;
    buttonLabelNode = node.querySelector('#status')!;
    timerNode = node.querySelector('#timer')!;
    btn.addEventListener('click', () => toggle());
    // start
    switchTimers(status, timerNode);
  }
}
