/**
 * GoldenNut Component - SolidJS Version
 *
 * Displays a collectible golden nut that appears randomly on screen.
 * When clicked, it awards nuts to the player.
 *
 * Migration notes:
 * - Replaced React.memo with SolidJS component (SolidJS has fine-grained reactivity by default)
 * - Replaced props destructuring with direct access
 * - Replaced onClick with onClick (SolidJS uses same event handlers)
 * - Kept all styling and animation logic identical
 *
 * TODO: AGENT - Consider using SolidJS <For> if multiple golden nuts can exist
 */

import { type Component } from "solid-js";
import type { GoldenNutState } from "../engine/hooks";

interface GoldenNutProps {
  nut: GoldenNutState;
  fadeMs: number;
  lifetimeMs: number;
  onCollect: () => void;
}

/**
 * GoldenNut - A collectible nut that appears on screen
 *
 * @param nut - The golden nut state (position, reward, timing)
 * @param fadeMs - Duration of fade-out animation in milliseconds
 * @param lifetimeMs - Total lifetime of the nut in milliseconds
 * @param onCollect - Callback when nut is collected
 */
const GoldenNut: Component<GoldenNutProps> = (props) => {
  const fadeStartRatio = Math.max(
    0,
    (props.lifetimeMs - props.fadeMs) / props.lifetimeMs,
  );

  return (
    <button
      type="button"
      aria-label={`Collect glowing nut for ${props.nut.reward} nuts`}
      title={`+${props.nut.reward} nuts`}
      onClick={props.onCollect}
      className="animate-golden-appear animate-golden-pulse fixed z-[9000] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-2 text-[clamp(2.5rem,6vw,3.5rem)] leading-none select-none hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gold"
      style={{
        left: `${props.nut.x}%`,
        top: `${props.nut.y}%`,
        animation: `
          golden-appear 280ms ease-out,
          golden-pulse 1.1s ease-in-out infinite,
          golden-nut-lifetime ${props.lifetimeMs}ms linear forwards
        `,
        // CSS custom property for fade keyframe
        // SolidJS note: Inline styles work the same as React
        ["--fade-start" as string]: `${(fadeStartRatio * 100).toFixed(1)}%`,
      }}
    >
      <style>{`
        @keyframes golden-nut-lifetime {
          0% { opacity: 0; transform: scale(0.55); }
          3% { opacity: 1; transform: scale(1); }
          ${(fadeStartRatio * 100).toFixed(1)}% { opacity: 1; }
          100% { opacity: 0; transform: scale(0.7); }
        }
      `}</style>
      F9F80
    </button>
  );
};

export default GoldenNut;
