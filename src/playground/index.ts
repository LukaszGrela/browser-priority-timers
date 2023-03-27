import {
  BrowserPriorityTimers,
  IBrowserPriorityTimers,
} from '../BrowserPriorityTimers';
import { example } from './example';
import './styles.css';
const priorityTimers: IBrowserPriorityTimers = new BrowserPriorityTimers();
// check availability
console.log('priorityTimers.workerAvailable', priorityTimers.workerAvailable());

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Browser Priority Timers example</h1>
    <a href="https://greladesign.co/blog" target="_blank">
      <h3>blog.greladesign</h3>
    </a>
    <div class="card" id="example" />
  </div>
`;

example(document.querySelector<HTMLDivElement>('#example')!);
