import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import GameConsole from './GameConsole';
import { formatNumber, formatTime } from '../utils/formatters';
import { Column, Heading1, Heading2, Heading3, Card } from '../styles/components';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const HeaderContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const StatsCard = styled(Card)`
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.sm};
  }
`;

const ConsoleCard = styled(Card)`
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.sm};
  }
`;

const StatValue = styled.span`
  color: ${theme.colors.primary};
`;

const DebugValue = styled(Heading2)`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;

const ResourceRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const ResourceItem = styled(Heading3)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const ResourceValue = styled.span`
  color: ${theme.colors.secondary};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Header: React.FC = () => {
  const gameState = useSelector((state: RootState) => state.game);
  const { nutsTotal, nutsAllTime, timer, resources } = gameState;
  
  return (
    <HeaderContainer>
      <StatsCard padding="md" id="stats">
        <Column gap="sm">
          <Heading1>
            🥜 <StatValue id="total">{formatNumber(nutsTotal)}</StatValue> Nuts
          </Heading1>
          <DebugValue>
            <span id="debug-total">{Math.round(nutsTotal * 1000) / 1000}</span>
          </DebugValue>
          <Heading3 id="nuts-running">
            All Time: {Math.round(nutsAllTime * 1000) / 1000}
          </Heading3>
          
          {/* Refined Resources */}
          {resources && (resources.nutwood > 0 || resources.stone > 0 || resources.bronze > 0 || resources.iron > 0) && (
            <ResourceRow>
              {resources.nutwood > 0 && (
                <ResourceItem>
                  🪵 <ResourceValue>{formatNumber(resources.nutwood)}</ResourceValue>
                </ResourceItem>
              )}
              {resources.stone > 0 && (
                <ResourceItem>
                  🪨 <ResourceValue>{formatNumber(resources.stone)}</ResourceValue>
                </ResourceItem>
              )}
              {resources.bronze > 0 && (
                <ResourceItem>
                  🔶 <ResourceValue>{formatNumber(resources.bronze)}</ResourceValue>
                </ResourceItem>
              )}
              {resources.iron > 0 && (
                <ResourceItem>
                  ⚙️ <ResourceValue>{formatNumber(resources.iron)}</ResourceValue>
                </ResourceItem>
              )}
            </ResourceRow>
          )}
          
          <Heading3 id="clock">
            ⏱️ {formatTime(timer.m, timer.s, timer.ms)}
          </Heading3>
        </Column>
      </StatsCard>
      <ConsoleCard padding="md" id="console">
        <GameConsole />
      </ConsoleCard>
    </HeaderContainer>
  );
};

export default Header;

