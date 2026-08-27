import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface SquirrelDisplayProps {
  squirrelId: number;
  showNutFinding?: boolean;
}

const SquirrelDisplay: React.FC<SquirrelDisplayProps> = ({
  squirrelId,
  showNutFinding = false,
}) => {
  const squirrel = useSelector((state: RootState) => state.game.squirrels[squirrelId]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState('0%');
  const [isFlipped, setIsFlipped] = useState(false);
  const previousTotalRef = useRef<number>(0);

  useEffect(() => {
    if (!squirrel || !showNutFinding) return;

    if (squirrel.total > previousTotalRef.current) {
      setAnimationPosition(`${Math.floor(Math.random() * 50)}%`);
      setShowAnimation(true);

      const timeout = setTimeout(() => {
        setShowAnimation(false);
        setAnimationPosition('0%');
      }, 600);

      previousTotalRef.current = squirrel.total;
      return () => clearTimeout(timeout);
    }

    previousTotalRef.current = squirrel.total;
  }, [squirrel, showNutFinding]);

  useEffect(() => {
    if (!showNutFinding) return;

    const flipInterval = setInterval(() => {
      setIsFlipped(Math.random() > 0.33);
    }, 1000);

    return () => clearInterval(flipInterval);
  }, [showNutFinding]);

  if (!squirrel) return null;

  return (
    <div className="relative inline-block p-2 text-5xl" id={`s-${squirrel._id}`}>
      <span
        className="inline-block transition-transform duration-300"
        style={{ transform: `scaleX(${isFlipped ? -1 : 1})` }}
      >
        🐿️
      </span>
      {showNutFinding && showAnimation && (
        <div
          id={`f-${squirrel._id}`}
          className="animate-found-nut absolute text-xl"
          style={{ left: animationPosition, top: '-2em' }}
        >
          🥜
        </div>
      )}
    </div>
  );
};

export default SquirrelDisplay;
