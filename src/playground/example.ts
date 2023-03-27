import {
  BrowserPriorityTimers,
  IBrowserPriorityTimers,
} from '../BrowserPriorityTimers';

type TUsedTimer = 'PRIORITY' | 'BUILT-IN';

export function example(node: HTMLElement): void {
  const priorityTimers: IBrowserPriorityTimers = new BrowserPriorityTimers();
  const SECOND = 1000;

  let timerNode: HTMLParagraphElement;
  let buttonLabelNode: HTMLSpanElement;
  let usedTimerType: TUsedTimer = 'PRIORITY';
  let timerId: number = -1;
  let date: number = 0;
  let counter = 0;
  let maxDiff = 0;

  function updateTimer(): void {
    const diff = date === 0 ? 0 : new Date().getTime() - date;

    maxDiff = Math.max(maxDiff, diff);
    timerNode.innerHTML = `Tick #${counter++} - last: ${(
      diff / 1000
    ).toPrecision(3)}s max: ${(maxDiff / 1000).toPrecision(3)}s`;
  }

  function tick(timerUsed: TUsedTimer): void {
    console.log(`Tick on ${timerUsed}`);
    updateTimer();
    date = new Date().getTime();
  }

  function switchTimers(): void {
    // reset
    counter = 0;
    date = 0;
    maxDiff = 0;
    if (usedTimerType === 'BUILT-IN') {
      // clear other timer
      priorityTimers.clearInterval(timerId);
      // use normal timers
      timerId = window.setInterval(tick, SECOND, usedTimerType);
    } else {
      // clear other timer
      window.clearInterval(timerId);
      // use priority timers
      timerId = priorityTimers.setInterval(tick, SECOND, usedTimerType);
    }
  }

  function toggle() {
    // update
    buttonLabelNode.innerHTML = `${usedTimerType}`;

    if (usedTimerType === 'PRIORITY') {
      usedTimerType = 'BUILT-IN';
    } else {
      usedTimerType = 'PRIORITY';
    }

    switchTimers();
  }

  if (node) {
    node.innerHTML = `
            <p>Switch to another tab, or minimise browser, then come back after some time to see the difference in timer.</p>
            <p>The longer you wait the longer the difference as built in timers are throttled.</p>
            <p>Priority timers are working on Workers so will not be throttled</p>
            <p id="timer"></p>
            <button id="toggle-timers">Use <span id="status"></span> timers.</button>
        `;

    buttonLabelNode = node.querySelector('#status')!;
    timerNode = node.querySelector('#timer')!;
    const btn = node.querySelector('#toggle-timers')!;
    btn.addEventListener('click', () => toggle());

    // start
    toggle();
  }
}
