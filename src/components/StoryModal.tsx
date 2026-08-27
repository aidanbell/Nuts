import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { dismissStory, makeChoice } from '../store/storySlice';
import { resumeGame, addNuts } from '../store/gameSlice';
import type { CheckpointCondition, StoryChoice } from '../types/story';

const StoryModal: React.FC = () => {
  const dispatch = useDispatch();
  const activeStoryId = useSelector((state: RootState) => state.story.activeStory);
  const checkpoints = useSelector((state: RootState) => state.story.checkpoints);
  const storyQueue = useSelector((state: RootState) => state.story.storyQueue);
  const gameState = useSelector((state: RootState) => state.game);

  if (!activeStoryId) return null;

  const checkpoint = checkpoints[activeStoryId];
  if (!checkpoint?.story) return null;

  const { story } = checkpoint;

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
        const productionCount = Object.values(gameState.jobSites.production).reduce(
          (total, jobsite) => total + Math.max(1, jobsite.level),
          0
        );
        const refinementCount = Object.values(gameState.jobSites.refinement).reduce(
          (total, jobsite) => total + Math.max(1, jobsite.level),
          0
        );
        currentValue = productionCount + refinementCount;
        break;
      }
      default:
        return false;
    }

    if (typeof value === 'number' && typeof currentValue === 'number') {
      switch (operator) {
        case '>=':
          return currentValue >= value;
        case '>':
          return currentValue > value;
        case '==':
          return currentValue === value;
        case '<':
          return currentValue < value;
        case '<=':
          return currentValue <= value;
        default:
          return false;
      }
    }

    return false;
  };

  const isChoiceAvailable = (choice: StoryChoice): boolean => {
    if (!choice.requirements) return true;
    return choice.requirements.every((req) => checkCondition(req));
  };

  const handleDismiss = () => {
    dispatch(dismissStory());
    if (storyQueue.length === 0) dispatch(resumeGame());
  };

  const handleChoice = (choiceId: string) => {
    const choice = story.choices?.find((c) => c.id === choiceId);
    if (choice?.effects?.addNuts) {
      dispatch(addNuts(choice.effects.addNuts));
    }
    dispatch(makeChoice({ checkpointId: activeStoryId, choiceId }));
    if (storyQueue.length === 0) dispatch(resumeGame());
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-bark/70 p-4"
      onClick={handleDismiss}
    >
      <div
        className="card max-h-[80vh] w-full max-w-xl overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {story.character && (
            <p className="text-xs font-bold tracking-widest text-moss uppercase">
              {story.character.replace('_', ' ')}
            </p>
          )}
          <h2 className="font-display text-2xl font-bold">{story.title}</h2>
          <hr className="border-moss/15" />
          <p className="text-base leading-relaxed md:text-lg">{story.body}</p>

          {story.choices && story.choices.length > 0 ? (
            <div className="space-y-3">
              {story.choices.map((choice) => {
                const available = isChoiceAvailable(choice);
                return (
                  <div key={choice.id} className={available ? '' : 'opacity-50'}>
                    <button
                      type="button"
                      className={`btn w-full ${available ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => available && handleChoice(choice.id)}
                      disabled={!available}
                    >
                      {choice.text}
                    </button>
                    {choice.description && (
                      <p className="muted mt-1">
                        {choice.description}
                        {!available && ' (Requirements not met)'}
                      </p>
                    )}
                  </div>
                );
              })}
              {storyQueue.length > 0 && (
                <p className="rounded-md bg-sage/50 p-2 text-center text-xs text-muted italic">
                  {storyQueue.length} more {storyQueue.length === 1 ? 'story' : 'stories'} waiting...
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <button type="button" className="btn btn-primary" onClick={handleDismiss}>
                  Continue
                </button>
              </div>
              {storyQueue.length > 0 && (
                <p className="rounded-md bg-sage/50 p-2 text-center text-xs text-muted italic">
                  {storyQueue.length} more {storyQueue.length === 1 ? 'story' : 'stories'} waiting...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
