import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { dismissStory, makeChoice } from '../store/storySlice';
import { resumeGame, addNuts } from '../store/gameSlice';
import type { CheckpointCondition, StoryChoice } from '../types/story';
import styled from 'styled-components';
import { Card, Column, Row, Button, Heading2, Text, Divider } from '../styles';
import { theme } from '../styles/theme';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalCard = styled(Card)`
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const CharacterName = styled(Text)`
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  font-size: ${theme.typography.fontSize.sm};
  letter-spacing: 1px;
`;

const StoryBody = styled(Text)`
  line-height: 1.8;
  font-size: ${theme.typography.fontSize.lg};
`;

const ChoiceButton = styled(Button)`
  width: 100%;
`;

const ChoiceDescription = styled(Text)`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
  opacity: 0.7;
  margin-top: ${theme.spacing.xs};
`;

const ChoiceContainer = styled.div<{ disabled?: boolean }>`
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const QueueIndicator = styled(Text)`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textLight};
  text-align: center;
  font-style: italic;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm};
`;

const StoryModal: React.FC = () => {
  const dispatch = useDispatch();
  const activeStoryId = useSelector((state: RootState) => state.story.activeStory);
  const checkpoints = useSelector((state: RootState) => state.story.checkpoints);
  const storyQueue = useSelector((state: RootState) => state.story.storyQueue);
  const gameState = useSelector((state: RootState) => state.game);
  
  if (!activeStoryId) return null;
  
  const checkpoint = checkpoints[activeStoryId];
  if (!checkpoint || !checkpoint.story) return null;
  
  const { story } = checkpoint;
  
  // Check if a condition is met (same logic as useStoryCheckpoints)
  const checkCondition = (condition: CheckpointCondition): boolean => {
    const { type, value, operator = '>=' } = condition;
    let currentValue: number | string = 0;
    
    switch (type) {
      case 'nuts_collected':
        currentValue = gameState.nutsTotal;
        break;
      case 'squirrels_count':
        currentValue = Object.keys(gameState.squirrels).length;
        break;
      case 'jobsites_purchased': {
        const productionCapacity = Object.values(gameState.jobSites.production).reduce(
          (total, jobsite) => total + jobsite.capacity, 
          0
        );
        const refinementCapacity = Object.values(gameState.jobSites.refinement).reduce(
          (total, jobsite) => total + jobsite.capacity, 
          0
        );
        currentValue = productionCapacity + refinementCapacity;
        break;
      }
      default:
        return false;
    }
    
    if (typeof value === 'number' && typeof currentValue === 'number') {
      switch (operator) {
        case '>=': return currentValue >= value;
        case '>': return currentValue > value;
        case '==': return currentValue === value;
        case '<': return currentValue < value;
        case '<=': return currentValue <= value;
        default: return false;
      }
    }
    
    return false;
  };
  
  // Check if a choice is available
  const isChoiceAvailable = (choice: StoryChoice): boolean => {
    if (!choice.requirements) return true;
    return choice.requirements.every(req => checkCondition(req));
  };
  
  const handleDismiss = () => {
    dispatch(dismissStory());
    
    // Only resume game if there are no more stories in the queue
    // (dismissStory will automatically show the next story if one exists)
    if (storyQueue.length === 0) {
      dispatch(resumeGame());
    }
  };
  
  const handleChoice = (choiceId: string) => {
    const choice = story.choices?.find(c => c.id === choiceId);
    
    // Apply addNuts effect if present (before makeChoice)
    if (choice?.effects?.addNuts) {
      dispatch(addNuts(choice.effects.addNuts));
    }
    
    dispatch(makeChoice({ checkpointId: activeStoryId, choiceId }));
    
    // Only resume game if there are no more stories in the queue
    // (makeChoice will automatically show the next story if one exists)
    if (storyQueue.length === 0) {
      dispatch(resumeGame());
    }
  };
  
  return (
    <ModalOverlay onClick={handleDismiss}>
      <ModalCard 
        padding="xl" 
        elevated
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Column gap="lg">
          {/* Header */}
          <Column gap="sm">
            {story.character && (
              <CharacterName>
                {story.character.replace('_', ' ')}
              </CharacterName>
            )}
            <Heading2>{story.title}</Heading2>
          </Column>
          
          <Divider />
          
          {/* Story Body */}
          <StoryBody>{story.body}</StoryBody>
          
          {/* Choices or Continue Button */}
          {story.choices && story.choices.length > 0 ? (
            <>
              <Column gap="md">
                {story.choices.map((choice) => {
                  const available = isChoiceAvailable(choice);
                  return (
                    <ChoiceContainer key={choice.id} disabled={!available}>
                      <Column gap="xs">
                        <ChoiceButton
                          variant={available ? "primary" : "secondary"}
                          onClick={() => available && handleChoice(choice.id)}
                          disabled={!available}
                        >
                          {choice.text}
                        </ChoiceButton>
                        {choice.description && (
                          <ChoiceDescription>
                            {choice.description}
                            {!available && " (Requirements not met)"}
                          </ChoiceDescription>
                        )}
                      </Column>
                    </ChoiceContainer>
                  );
                })}
              </Column>
              {storyQueue.length > 0 && (
                <QueueIndicator>
                  {storyQueue.length} more {storyQueue.length === 1 ? 'story' : 'stories'} waiting...
                </QueueIndicator>
              )}
            </>
          ) : (
            <>
              <Row justify="flex-end">
                <Button variant="primary" onClick={handleDismiss}>
                  Continue
                </Button>
              </Row>
              {storyQueue.length > 0 && (
                <QueueIndicator>
                  {storyQueue.length} more {storyQueue.length === 1 ? 'story' : 'stories'} waiting...
                </QueueIndicator>
              )}
            </>
          )}
        </Column>
      </ModalCard>
    </ModalOverlay>
  );
};

export default StoryModal;
