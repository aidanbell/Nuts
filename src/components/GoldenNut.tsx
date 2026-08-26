import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import type { GoldenNutState } from '../hooks/useGoldenNut';

interface GoldenNutProps {
  nut: GoldenNutState;
  fadeMs: number;
  lifetimeMs: number;
  onCollect: () => void;
}

const pulse = keyframes`
  0%, 100% {
    transform: scale(1) rotate(-6deg);
    filter: drop-shadow(0 0 6px ${theme.colors.gold})
      drop-shadow(0 0 14px rgba(255, 215, 0, 0.55));
  }
  50% {
    transform: scale(1.12) rotate(6deg);
    filter: drop-shadow(0 0 10px ${theme.colors.gold})
      drop-shadow(0 0 22px rgba(255, 215, 0, 0.8));
  }
`;

const appear = keyframes`
  from {
    opacity: 0;
    transform: scale(0.55);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const NutButton = styled.button<{
  $x: number;
  $y: number;
  $fadeStartRatio: number;
  $lifetimeMs: number;
}>`
  position: fixed;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  z-index: 9000;
  translate: -50% -50%;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: ${theme.spacing.sm};
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  line-height: 1;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  @keyframes golden-nut-lifetime {
    0% {
      opacity: 0;
      transform: scale(0.55);
    }
    3% {
      opacity: 1;
      transform: scale(1);
    }
    ${({ $fadeStartRatio }) => ($fadeStartRatio * 100).toFixed(1)}% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(0.7);
    }
  }

  animation:
    ${appear} 280ms ease-out,
    ${pulse} 1.1s ease-in-out infinite,
    golden-nut-lifetime ${({ $lifetimeMs }) => $lifetimeMs}ms linear forwards;

  &:hover {
    filter: brightness(1.15);
  }

  &:active {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.gold};
    outline-offset: 4px;
    border-radius: ${theme.borderRadius.md};
  }
`;

const GoldenNut: React.FC<GoldenNutProps> = ({
  nut,
  fadeMs,
  lifetimeMs,
  onCollect,
}) => {
  const fadeStartRatio = Math.max(0, (lifetimeMs - fadeMs) / lifetimeMs);

  return (
    <NutButton
      type="button"
      aria-label={`Collect glowing nut for ${nut.reward} nuts`}
      title={`+${nut.reward} nuts`}
      $x={nut.x}
      $y={nut.y}
      $fadeStartRatio={fadeStartRatio}
      $lifetimeMs={lifetimeMs}
      onClick={onCollect}
    >
      🥜
    </NutButton>
  );
};

export default memo(GoldenNut);
