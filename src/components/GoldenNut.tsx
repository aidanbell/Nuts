import type { Component } from "solid-js";
import type { GoldenNutState } from "./createGoldenNut";

interface GoldenNutProps {
  nut: GoldenNutState;
  fadeMs: number;
  lifetimeMs: number;
  onCollect: () => void;
}

const GoldenNut: Component<GoldenNutProps> = (props) => {
  const fadeStartRatio = () =>
    Math.max(0, (props.lifetimeMs - props.fadeMs) / props.lifetimeMs);

  const fadeStartPercent = () => (fadeStartRatio() * 100).toFixed(1);

  return (
    <button
      type="button"
      aria-label={`Collect glowing nut for ${props.nut.reward} nuts`}
      title={`+${props.nut.reward} nuts`}
      onClick={() => props.onCollect()}
      class="animate-golden-appear animate-golden-pulse fixed z-[9000] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-2 text-[clamp(2.5rem,6vw,3.5rem)] leading-none select-none hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gold"
      style={{
        left: `${props.nut.x}%`,
        top: `${props.nut.y}%`,
        animation: `
          golden-appear 280ms ease-out,
          golden-pulse 1.1s ease-in-out infinite,
          golden-nut-lifetime ${props.lifetimeMs}ms linear forwards
        `,
        ["--fade-start" as string]: `${fadeStartPercent()}%`,
      }}
    >
      <style>{`
        @keyframes golden-nut-lifetime {
          0% { opacity: 0; transform: scale(0.55); }
          3% { opacity: 1; transform: scale(1); }
          ${fadeStartPercent()}% { opacity: 1; }
          100% { opacity: 0; transform: scale(0.7); }
        }
      `}</style>
      🥜
    </button>
  );
};

export default GoldenNut;
