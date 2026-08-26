import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { craftRefinement } from '../../store/gameSlice';
import { refinementJobsites } from '../../data/jobsites';
import { formatNumber } from '../../utils/formatters';
import { Column, Row, Card, Heading2, Heading3, Button, TabContainer } from '../../styles/components';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const RefinementCard = styled(Card)`
  max-width: 600px;
`;

const ResourceDisplay = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

const ResourceItem = styled.div<{ $hasEnough?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.$hasEnough ? theme.colors.surface : theme.colors.danger}20;
  border: 1px solid ${props => props.$hasEnough ? theme.colors.border : theme.colors.danger};
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.$hasEnough ? theme.colors.text : theme.colors.danger};
`;

const Arrow = styled.span`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.textMuted};
`;

const CraftButton = styled(Button)`
  font-size: ${theme.typography.fontSize.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
`;

const Description = styled.p`
  color: ${theme.colors.textLight};
  margin: 0;
`;

const RefinementTab: React.FC = () => {
  const dispatch = useDispatch();
  const { nutsTotal, resources } = useSelector((state: RootState) => state.game);
  
  // Get NutWood refinement data
  const nutwoodRefinement = refinementJobsites.find(js => js.id === 'nutwoodRefinement');
  
  if (!nutwoodRefinement || !nutwoodRefinement.consumes || !nutwoodRefinement.produces) {
    return (
      <Column gap="md">
        <Heading2>🏭 Refinement</Heading2>
        <Card padding="md">
          <p>No refinements available yet.</p>
        </Card>
      </Column>
    );
  }
  
  const { resource: consumeType, amount: consumeAmount } = nutwoodRefinement.consumes;
  const { resource: produceType, amount: produceAmount } = nutwoodRefinement.produces;
  
  // Get current resource counts
  const availableResource = consumeType === 'nuts' ? nutsTotal : resources[consumeType as keyof typeof resources];
  const hasEnoughResources = availableResource >= consumeAmount;
  
  const handleCraft = () => {
    if (hasEnoughResources) {
      dispatch(craftRefinement({ refinementId: 'nutwoodRefinement' }));
    }
  };
  
  return (
    <TabContainer id="refinement-content">
      <Column gap="md">
        <Heading2>🏭 Manual Refinement</Heading2>
        <Description>
          Refine raw materials into useful resources. Later you'll unlock automated refineries!
        </Description>
        
        <RefinementCard padding="lg">
          <Column gap="md">
            <Heading3>🪵 Craft NutWood</Heading3>
            
            <ResourceDisplay>
              <ResourceItem $hasEnough={hasEnoughResources}>
                {consumeType === 'nuts' ? '🥜' : '❓'} 
                <strong>{consumeAmount}</strong> {consumeType}
                <span style={{ fontSize: '0.8em', color: theme.colors.textMuted }}>
                  ({formatNumber(availableResource)} available)
                </span>
              </ResourceItem>
              
              <Arrow>→</Arrow>
              
              <ResourceItem $hasEnough={true}>
                🪵 <strong>{produceAmount}</strong> {produceType}
              </ResourceItem>
            </ResourceDisplay>
            
            <Row gap="md">
              <CraftButton
                onClick={handleCraft}
                disabled={!hasEnoughResources}
                variant="primary"
              >
                Craft NutWood
              </CraftButton>
            </Row>
            
            {!hasEnoughResources && (
              <Description style={{ color: theme.colors.danger }}>
                ⚠️ Not enough {consumeType}! Need {consumeAmount - availableResource} more.
              </Description>
            )}
          </Column>
        </RefinementCard>
      </Column>
    </TabContainer>
  );
};

export default RefinementTab;
