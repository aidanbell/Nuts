import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import TabContent from './TabContent';
import GoldenNut from './GoldenNut';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Container } from '../styles/components';
import { useGoldenNut } from '../hooks/useGoldenNut';

const GameWrapper = styled.div`
  margin: 0 auto;
  gap: ${theme.spacing.md};

  display: flex;
  flex-direction: row;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.sm};
  }
`;

const GameContainer: React.FC = () => {
  const activeTab = useSelector((state: RootState) => state.game.activeTab);
  const { goldenNut, collectGoldenNut, fadeMs } = useGoldenNut();
  
  return (
    <Container>
      <Header />
      <GameWrapper>
        <Navigation />
        <TabContent activeTab={activeTab} />
      </GameWrapper>
      {goldenNut && (
        <GoldenNut
          key={`${goldenNut.id}-${goldenNut.expiresAt}`}
          nut={goldenNut}
          fadeMs={fadeMs}
          lifetimeMs={goldenNut.durationMs}
          onCollect={collectGoldenNut}
        />
      )}
    </Container>
  );
};

export default GameContainer;

