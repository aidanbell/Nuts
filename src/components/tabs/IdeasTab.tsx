import React, { memo, useState } from 'react';
import { useIdeas } from '../../hooks/useIdeas';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Idea } from '../../types/ideas';
import styled from 'styled-components';
import { 
  Card, 
  Column, 
  Row, 
  Heading2, 
  Heading3, 
  Text, 
  Button,
  Badge,
  Divider,
  Switch,
} from '../../styles/components';
import { formatNumber } from '../../utils/formatters';
import { theme } from '../../styles/theme';

const Chevron = styled.span<{ $expanded: boolean }>`
  display: inline-block;
  transition: transform ${theme.transitions.fast};
  transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  font-size: 1.2em;
  margin-right: ${theme.spacing.xs};
`;

const CollapsibleCard = styled(Card)<{ $expanded: boolean; $elevated: boolean }>`
  cursor: pointer;
  padding: ${theme.spacing.md};
  opacity: ${({ $elevated }) => $elevated ? 1 : 0.6};
  position: relative;
  background: ${({ $expanded }) => $expanded ? theme.colors.hover : theme.colors.surface};
  border: 2px solid ${({ $expanded }) => $expanded ? theme.colors.primary : theme.colors.border};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${theme.colors.primary};
  }
`;

interface IdeaCardProps {
  idea: Idea;
  onResearch: () => void;
  canAfford: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onResearch, 
  canAfford,
  isExpanded,
  onToggle
}) => {
  const getCategoryColor = (category: string): 'success' | 'info' | 'warning' | 'primary' | 'danger' => {
    switch (category) {
      case 'production': return 'success';
      case 'efficiency': return 'info';
      case 'capacity': return 'warning';
      case 'automation': return 'primary';
      case 'meta': return 'danger';
      default: return 'primary';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'production': return '🏭';
      case 'efficiency': return '⚡';
      case 'capacity': return '👥';
      case 'automation': return '🤖';
      case 'meta': return '✨';
      default: return '💡';
    }
  };
  
  const getEffectDescription = (idea: Idea): string[] => {
    const effects: string[] = [];
    const e = idea.effects;
    
    if (e.unlockJobsites) {
      effects.push(`Unlocks: ${e.unlockJobsites.join(', ')}`);
    }
    if (e.unlockBuildings) {
      effects.push(`Unlocks: ${e.unlockBuildings.join(', ')}`);
    }
    if (e.globalEfficiency) {
      effects.push(`+${(e.globalEfficiency * 100).toFixed(0)}% Global Efficiency`);
    }
    if (e.unlockSquirrelCapacity) {
      effects.push(`+${e.unlockSquirrelCapacity} Squirrel Capacity`);
    }
    if (e.reduceJobsiteCost) {
      effects.push(`-${(e.reduceJobsiteCost * 100).toFixed(0)}% Jobsite Costs`);
    }
    if (e.upgradeJobsite) {
      effects.push(`+${e.upgradeJobsite.amount} ${e.upgradeJobsite.property} ${e.upgradeJobsite.jobsiteId} Efficiency`);
    }
    
    return effects;
  };
  
  return (
    <CollapsibleCard
      $expanded={isExpanded}
      $elevated={canAfford && !idea.researched}
      onClick={onToggle}
    >
      <Column gap="sm">
        {/* Header - Always Visible */}
        <Row gap="sm" justify="space-between" align="center">
          <Row gap="sm" align="center">
            <Chevron $expanded={isExpanded}>▼</Chevron>
            <span style={{ fontSize: "1.5em" }}>
              {getCategoryIcon(idea.category)}
            </span>
            <Heading3 style={{ margin: 0 }}>{idea.name}</Heading3>
          </Row>
          <Row gap="sm" align="center">
            {idea.researched && <Badge variant="success">✓</Badge>}
            <Badge variant={getCategoryColor(idea.category)}>
              {idea.category.charAt(0).toUpperCase()}
            </Badge>
            <Text size="sm" weight="semibold">
              🥜 {formatNumber(idea.cost.nuts || 0)} 
              <br />
              {idea.cost.nutwood && ` 🪵 ${formatNumber(idea.cost.nutwood || 0)}`}
              <br />
              {idea.cost.stone && ` 🪨 ${formatNumber(idea.cost.stone || 0)}`}
              <br />
              {idea.cost.bronze && ` 🔶 ${formatNumber(idea.cost.bronze || 0)}`}
            </Text>
          </Row>
        </Row>

        {/* Expanded Details */}
        {isExpanded && (
          <>
            <Text size="sm" color="#666">
              {idea.description}
            </Text>

            <Divider />

            <Column gap="xs">
              <Text size="sm" weight="semibold">
                Effects:
              </Text>
              {getEffectDescription(idea).map((effect, idx) => (
                <Text key={idx} size="sm" color="#555">
                  • {effect}
                </Text>
              ))}
            </Column>

            <Button
              variant={canAfford ? "primary" : "secondary"}
              size="sm"
              disabled={idea.researched || !canAfford}
              onClick={(e) => {
                e.stopPropagation();
                onResearch();
              }}
              style={{ marginTop: "8px" }}
            >
              {idea.researched
                ? "Researched"
                : canAfford
                ? "Research"
                : "Not Enough Nuts"}
            </Button>
          </>
        )}
      </Column>
    </CollapsibleCard>
  );
};

const IdeasTab: React.FC = () => {
  const { visibleIdeas, researchedIdeas, canAfford, research } = useIdeas();
  const nutsTotal = useSelector((state: RootState) => state.game.nutsTotal);
  const currentEra = useSelector((state: RootState) => state.story.currentEra);
  const [showResearched, setShowResearched] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  // Group ideas by era
  const ideasByEra = visibleIdeas.reduce((acc, idea) => {
    if (!acc[idea.era]) {
      acc[idea.era] = [];
    }
    acc[idea.era].push(idea);
    return acc;
  }, {} as Record<string, Idea[]>);
  
  // Era order
  const eraOrder = [
    'PREHISTORY',
    'WOOD_AGE',
    'STONE_AGE',
    'BRONZE_AGE', 
    'IRON_AGE',
    'INDUSTRIAL_AGE',
    'INFORMATION_AGE',
    'TECHNOLOGY_AGE',
    'SPACE_AGE',
    'GALACTIC_AGE'
  ];

  const currentEraIndex = eraOrder.indexOf(currentEra || "PREHISTORY");
  const erasToShow = eraOrder.slice(0, currentEraIndex + 1);
  
  return (
    <Card id="ideas-content">
      <Column gap="md" style={{ padding: '20px' }}>
        <Row justify="space-between" align="center">
          <Heading2>💡 Ideas & Research</Heading2>
          {currentEra && (
            <Column gap="xs" align="flex-end">
              <Text size="sm" color="#666">
                Current Era: <strong>{currentEra.replace('_', ' ')}</strong>
              </Text>
              <Text size="sm" color="#666">
                Researched: <strong>{researchedIdeas.length} / {visibleIdeas.length}</strong>
              </Text>
              <Text size="md">
                🥜 {formatNumber(nutsTotal)}
              </Text>
              <Text size="md">
                Show Researched: <Switch checked={showResearched} onChange={() => setShowResearched(!showResearched)} />
              </Text>
            </Column>
          )}
        </Row>
        
        <Divider />
        
        {visibleIdeas.filter(idea => showResearched || !idea.researched).length === 0 && (
          <Card padding="lg">
            <Column gap="sm" align="center">
              <Text size="lg">🔒 No ideas available yet</Text>
              <Text size="sm" color="#666">
                Keep gathering nuts and growing your colony to unlock new research!
              </Text>
            </Column>
          </Card>
        )}
        
        {erasToShow.map(era => {
          const eraIdeas = ideasByEra[era];
          if (!eraIdeas || eraIdeas.length === 0) return null;
          
          const filteredIdeas = eraIdeas.filter(idea => showResearched || !idea.researched);
          const researchedCount = eraIdeas.filter(idea => idea.researched).length;
          
          return (
            <Column key={era} gap="md">
              <Row justify="space-between" align="center">
                <Heading3>
                  {era.replace('_', ' ')}
                </Heading3>
                <Badge variant={researchedCount === eraIdeas.length ? 'success' : 'info'}>
                  {researchedCount} / {eraIdeas.length}
                </Badge>
              </Row>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px'
              }}>
                {filteredIdeas.map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onResearch={() => research(idea.id)}
                    canAfford={canAfford(idea)}
                    isExpanded={expandedIdea === idea.id}
                    onToggle={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                  />
                ))}
              </div>
            </Column>
          );
        })}
      </Column>
    </Card>
  );
};

export default memo(IdeasTab);

