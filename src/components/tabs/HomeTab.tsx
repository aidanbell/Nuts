import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import SquirrelDisplay from '../SquirrelDisplay';
import styled from 'styled-components';
import { TabContainer, Column, Heading2, Text, Panel, Button, Heading3 } from '../../styles/components';
import { theme } from '../../styles/theme';
import { setEra } from '../../store/storySlice';

const SquirrelGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  justify-content: center;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    gap: ${theme.spacing.xs};
  }
`;

const EraAdvancementPanel = styled(Panel)`
  margin-bottom: ${theme.spacing.lg};
`;

const EraDescription = styled(Text)`
  margin: ${theme.spacing.sm} 0;
  color: ${theme.colors.textLight};
`;

const HomeTab: React.FC = () => {
  const dispatch = useDispatch();
  const joblessSquirrels = useSelector((state: RootState) => state.game.population.jobless);
  const currentEra = useSelector((state: RootState) => state.story.currentEra);
  const unlockedTabs = useSelector((state: RootState) => state.game.unlockedTabs);
  const nutsTotal = useSelector((state: RootState) => state.game.nutsTotal);
  
  const handleAdvanceEra = () => {
    if (currentEra === 'PREHISTORY') {
      dispatch(setEra('WOOD_AGE'));
    }
  };
  
  const canAdvanceToWoodAge = unlockedTabs.includes('eras') && currentEra === 'PREHISTORY';
  
  return (
    <TabContainer id="home-content">
      {unlockedTabs.includes('eras') && (
        <Column gap="lg">
          <Column gap="sm">
            <Heading2>Current Era:</Heading2>
            <Text size="xl" weight="semibold">
              {currentEra?.replace(/_/g, ' ') || 'PREHISTORY'}
            </Text>
          </Column>
          
          {canAdvanceToWoodAge && (
            <EraAdvancementPanel variant="info">
              <Column gap="md">
                <Heading3>🌳 The Wood Age Awaits</Heading3>
                <EraDescription>
                  Your squirrels have discovered refined materials! The Wood Age offers new 
                  possibilities - refined tools, better jobsites, and greater productivity. 
                  Choose when you're ready to advance.
                </EraDescription>
                <EraDescription>
                  <strong>Tip:</strong> Gather more nuts before advancing for a stronger start 
                  in the new era. Current nuts: {nutsTotal.toLocaleString()}
                </EraDescription>
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={handleAdvanceEra}
                >
                  Advance to Wood Age →
                </Button>
              </Column>
            </EraAdvancementPanel>
          )}
        </Column>
      )}
      
      <Column gap="md">
        <Heading2>Population:</Heading2>
        <Text>
          {joblessSquirrels.length} jobless squirrels
        </Text>
        <SquirrelGrid id="jobless">
          {joblessSquirrels.map((squirrelId) => (
            <SquirrelDisplay 
              key={squirrelId} 
              squirrelId={squirrelId} 
              showNutFinding={true}
            />
          ))}
        </SquirrelGrid>
      </Column>
    </TabContainer>
  );
};

export default memo(HomeTab);

