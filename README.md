# BrowserPriorityTimers

Browsers for optimisation throttles the tabs that are not visible. This slows down any timers the page is executing. When your application requires the timer to work reliably even in the background you can use the web workers as those are on separate thread and are not limited by aforementioned optimisation. The `BrowserPriorityTimers` class implements the timers API on the web worker thread.

## API

### `workerAvailable()`

This class depends on the following features to be available on the `window` object: `URL`, `Worker` and `Blob`. If those are not available then the `workerAvailable` method will return `false`, also the `setTimeout` and `setInterval` will return `-1` and will not work.

```TypeScript
const timers = new BrowserPriorityTimers();

if(!timers.workerAvailable()) {
  console.warn("Priority timers are not available for this browser");
}
```

### `setInterval` / `clearInterval`

```TypeScript
const timers = new BrowserPriorityTimers();

if(timers.workerAvailable()) {
  const intervalId = timers.setInterval(() => {
    console.log("Tick...");
    timers.clearInterval(intervalId);
  }, 200);
}
```

### `setTimeout` / `clearTimeout`

```TypeScript
const timers = new BrowserPriorityTimers();

if(timers.workerAvailable()) {
  const intervalId = timers.setTimeout(() => {
    console.log("Tick...");
  }, 200);
  timers.clearTimeout(intervalId);
}
```

## Acknowledgment

- Project bootstrapped with [vite-vanilla-ts-lib-starter](https://github.com/kbysiec/vite-vanilla-ts-lib-starter)

## License

MIT
