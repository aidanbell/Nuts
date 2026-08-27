import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

/**
 * Smoothly eases a displayed number toward a reactive target.
 */
export function createAnimatedNumber(getTarget: () => number) {
  const [display, setDisplay] = createSignal(getTarget());
  const targetRef = { current: getTarget() };

  createEffect(() => {
    targetRef.current = getTarget();
  });

  onMount(() => {
    let frame = 0;

    const tick = () => {
      const goal = targetRef.current;
      setDisplay((current) => {
        const diff = goal - current;
        if (Math.abs(diff) < 0.01) return goal;

        // Catch up faster on big jumps (golden nut / bulk grants / spends)
        const alpha =
          Math.abs(diff) > Math.max(50, Math.abs(goal) * 0.15) ? 0.28 : 0.12;
        return current + diff * alpha;
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    onCleanup(() => cancelAnimationFrame(frame));
  });

  return display;
}
