import type { Clock } from "../engine/platform";

/** No rAF outside a browser — a fixed interval stands in for a frame tick. */
const FRAME_INTERVAL_MS = 100;

export const terminalClock: Clock = {
  now: () => performance.now(),
  nextFrame(cb) {
    const id = setTimeout(() => cb(performance.now()), FRAME_INTERVAL_MS);
    return () => clearTimeout(id);
  },
  every(ms, cb) {
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  },
};
