import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import styled from 'styled-components';

interface SquirrelDisplayProps {
  squirrelId: number;
  showNutFinding?: boolean;
}

const SquirrelContainer = styled.div`
  position: relative;
  font-size: 4em;
  display: inline-block;
  padding: 8px;
`;

const SquirrelIcon = styled.span<{ $flipped: boolean }>`
  display: inline-block;
  transform: scaleX(${({ $flipped }) => $flipped ? -1 : 1});
  transition: transform 0.3s ease;
`;

const NutAnimation = styled.div<{ $left: string }>`
  font-size: 20px;
  position: absolute;
  top: -2em;
  left: ${({ $left }) => $left};
  animation: found-nut 600ms;
  
  @keyframes found-nut {
    from {
      opacity: 1;
      top: -2em;
    }
    to {
      opacity: 0;
      top: -4em;
    }
  }
`;

const SquirrelDisplay: React.FC<SquirrelDisplayProps> = ({ squirrelId, showNutFinding = false }) => {
  const squirrel = useSelector((state: RootState) => state.game.squirrels[squirrelId]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState('0%');
  const [isFlipped, setIsFlipped] = useState(false);
  const previousTotalRef = useRef<number>(0);
  
  // Track when the squirrel finds a nut by watching total changes
  useEffect(() => {
    if (!squirrel || !showNutFinding) return;
    
    // If total increased, squirrel found a nut!
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
  
  // Random flip animation for jobless squirrels
  useEffect(() => {
    if (!showNutFinding) return;
    
    const flipInterval = setInterval(() => {
      // 50% chance to flip
      setIsFlipped(Math.random() > 0.33);
    }, 1000); // Every second
    
    return () => clearInterval(flipInterval);
  }, [showNutFinding]);
  
  if (!squirrel) {
    return null;
  }
  
  return (
    <SquirrelContainer id={`s-${squirrel._id}`}>
      <SquirrelIcon $flipped={isFlipped}>
        🐿️
      </SquirrelIcon>
      {showNutFinding && showAnimation && (
        <NutAnimation 
          id={`f-${squirrel._id}`}
          $left={animationPosition}
        >
          🥜
        </NutAnimation>
      )}
    </SquirrelContainer>
  );
};

export default SquirrelDisplay;

