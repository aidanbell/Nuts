import type { Clock } from "../engine/platform";

export const browserClock: Clock = {
  now: () => performance.now(),
  nextFrame(cb) {
    const id = requestAnimationFrame(cb);
    return () => cancelAnimationFrame(id);
  },
  every(ms, cb) {
    const id = window.setInterval(cb, ms);
    return () => window.clearInterval(id);
  },
};
