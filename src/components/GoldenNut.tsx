import React, { memo } from "react";
import type { GoldenNutState } from "../hooks/useGoldenNut";

interface GoldenNutProps {
  nut: GoldenNutState;
  fadeMs: number;
  lifetimeMs: number;
  onCollect: () => void;
}

const GoldenNut: React.FC<GoldenNutProps> = ({
  nut,
  fadeMs,
  lifetimeMs,
  onCollect,
}) => {
  const fadeStartRatio = Math.max(0, (lifetimeMs - fadeMs) / lifetimeMs);

  return (
    <button
      type="button"
      aria-label={`Collect glowing nut for ${nut.reward} nuts`}
      title={`+${nut.reward} nuts`}
      onClick={onCollect}
      className="animate-golden-appear animate-golden-pulse fixed z-[9000] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-2 text-[clamp(2.5rem,6vw,3.5rem)] leading-none select-none hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-gold"
      style={{
        left: `${nut.x}%`,
        top: `${nut.y}%`,
        animation: `
          golden-appear 280ms ease-out,
          golden-pulse 1.1s ease-in-out infinite,
          golden-nut-lifetime ${lifetimeMs}ms linear forwards
        `,
        // CSS custom property for fade keyframe via inline style sheet isn't easy;
        // approximate with opacity transition near end using animation-delay is complex.
        // Keep lifetime fade via style tag below.
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
      🥜
    </button>
  );
};

export default memo(GoldenNut);
