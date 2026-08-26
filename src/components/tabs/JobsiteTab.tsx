import React, { useState, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { buyJobSiteCapacity, assignSquirrelToJobSite, removeSquirrelFromJobSite } from '../../store/gameSlice';
import { formatNumber, formatProductionRate } from '../../utils/formatters';
import SquirrelDisplay from '../SquirrelDisplay';
import styled from 'styled-components';
import { TabContainer, Column, Row, Card, Button, Heading2, Heading3, Text } from '../../styles/components';
import { theme } from '../../styles/theme';

const SquirrelGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  justify-content: center;
`;

const JobsiteCard = styled(Card)<{ $expanded: boolean }>`
  cursor: pointer;
  background: ${({ $expanded }) => $expanded ? theme.colors.hover : theme.colors.surface};
  border: 2px solid ${({ $expanded }) => $expanded ? theme.colors.primary : theme.colors.border};
  padding: ${theme.spacing.md};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${theme.colors.primary};
  }
`;

const Chevron = styled.span<{ $expanded: boolean }>`
  display: inline-block;
  transition: transform ${theme.transitions.fast};
  transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  font-size: 1.2em;
  margin-right: ${theme.spacing.sm};
`;

const JobsiteName = styled.span`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  flex: 1;
`;

const BuyButton = styled(Button)`
  font-size: ${theme.typography.fontSize.sm};
`;

interface JobSiteCardProps {
  jobSiteId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const JobSiteCardComponent: React.FC<JobSiteCardProps> = memo(({ jobSiteId, isExpanded, onToggle }) => {
  const dispatch = useDispatch();
  const jobSites = useSelector((state: RootState) => state.game.jobSites);
  const nuts = useSelector((state: RootState) => state.game.nutsTotal);
  const jobless = useSelector((state: RootState) => state.game.population.jobless);
  
  // Find the jobsite in either production or refinement
  const jobSite = jobSites.production[jobSiteId] || jobSites.refinement[jobSiteId];
  
  // Define all hooks before any early returns
  const handleBuy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(buyJobSiteCapacity(jobSiteId));
  }, [dispatch, jobSiteId]);

  const handleAddWorker = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobless.length > 0) {
      dispatch(assignSquirrelToJobSite({ squirrelId: jobless[0], jobSiteId }));
    }
  }, [dispatch, jobSiteId, jobless]);

  const handleRemoveWorker = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobSite?.workers && jobSite.workers.length > 0) {
      dispatch(removeSquirrelFromJobSite({ squirrelId: jobSite.workers[0], jobSiteId }));
    }
  }, [dispatch, jobSiteId, jobSite?.workers]);
  
  // Early return after all hooks
  if (!jobSite) return null;
  
  const canAfford = nuts >= jobSite.cost;
  const canAddWorker = jobSite.workers.length < jobSite.maxSquirrels && jobless.length > 0;
  const canRemoveWorker = jobSite.workers.length > 0;
  
  return (
    <JobsiteCard $expanded={isExpanded} onClick={onToggle}>
      <Column gap="md">
        {/* Header Row - Always Visible */}
        <Row gap="md" align="center" justify="space-between">
          <Row gap="sm" align="center">
            <Chevron $expanded={isExpanded}>▼</Chevron>
            <JobsiteName>{jobSite.name}</JobsiteName>
          </Row>
          <Row gap="sm" align="center">
            <Text size="sm" weight="semibold">
              👥 {jobSite.workers.length}/{jobSite.maxSquirrels}
            </Text>
            <Text size="sm" weight="semibold">
              Lv.{jobSite.level}
            </Text>
          </Row>
        </Row>
        
        {/* Expanded Details */}
        {isExpanded && (
          <>
            <Column gap="sm">
              <Row gap="lg" align="center" justify="space-between">
                <Column gap="xs">
                  <Text size="sm" color={theme.colors.textLight}>Total Production</Text>
                  <Heading2>
                    {formatProductionRate(
                      (jobSite.baseProduction + 
                       jobSite.squirrelBonus * jobSite.workers.length) * 
                      jobSite.multi
                    )}
                  </Heading2>
                </Column>
                <Column gap="xs">
                  <Text size="sm" color={theme.colors.textLight}>Base</Text>
                  <Text size="md">
                    {formatProductionRate(jobSite.baseProduction * jobSite.multi)}
                  </Text>
                </Column>
                <Column gap="xs">
                  <Text size="sm" color={theme.colors.textLight}>Per Squirrel</Text>
                  <Text size="md">
                    +{formatProductionRate(jobSite.squirrelBonus * jobSite.multi)}
                  </Text>
                </Column>
              </Row>
              
              <Row gap="sm" align="center" justify="space-between">
                <Row gap="sm">
                  <Button onClick={handleAddWorker} disabled={!canAddWorker} size="sm">
                    + Assign
                  </Button>
                  <Button onClick={handleRemoveWorker} disabled={!canRemoveWorker} size="sm">
                    - Remove
                  </Button>
                </Row>
                <Column gap="xs" align="flex-end">
                  <BuyButton 
                    variant={canAfford ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={handleBuy}
                    disabled={!canAfford}
                  >
                    Upgrade
                  </BuyButton>
                  <Text size="sm" weight="semibold">
                    🥜 {formatNumber(jobSite.cost)}
                  </Text>
                </Column>
              </Row>
            </Column>
          </>
        )}
      </Column>
    </JobsiteCard>
  );
});

JobSiteCardComponent.displayName = 'JobSiteCardComponent';

const JobsiteTab: React.FC = () => {
  const [expandedJobSite, setExpandedJobSite] = useState<string | null>(null);
  const jobSites = useSelector((state: RootState) => state.game.jobSites);
  const population = useSelector((state: RootState) => state.game.population);
  
  // Combine production and refinement jobsites
  const jobSiteArray = [
    ...Object.values(jobSites.production),
    ...Object.values(jobSites.refinement)
  ];
  
  return (
    <TabContainer id="jobsite-content">
      <Column gap="lg">
        <Column gap="md">
          <Heading2>👷 Available Workers</Heading2>
          <SquirrelGrid>
            {population.jobless.map((squirrelId) => (
              <SquirrelDisplay key={squirrelId} squirrelId={squirrelId} showNutFinding={false} />
            ))}
          </SquirrelGrid>
        </Column>
        
        <Column gap="md">
          <Heading3>🏭 Job Sites</Heading3>
          {jobSiteArray.map((jobSite) => (
            <JobSiteCardComponent 
              key={jobSite.id} 
              jobSiteId={jobSite.id}
              isExpanded={expandedJobSite === jobSite.id}
              onToggle={() => setExpandedJobSite(expandedJobSite === jobSite.id ? null : jobSite.id)}
            />
          ))}
        </Column>
      </Column>
    </TabContainer>
  );
};

export default memo(JobsiteTab);

