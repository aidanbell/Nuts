/**
 * StoryModal Component - SolidJS Version
 *
 * Displays story checkpoints with choices to the player.
 * Handles story dismissal and choice selection.
 *
 * Migration notes:
 * - Replaced React.FC with SolidJS Component type
 * - Replaced useSelector/useDispatch with direct appState access and actions
 * - Replaced .map() with SolidJS <For> for efficient list rendering
 * - Replaced useEffect with createEffect
 * - All story logic preserved
 *
 * TODO: AGENT - Consider extracting checkCondition logic to a utility
 */

import {
  type Component,
  createSignal,
  For,
  createMemo,
  onCleanup,
} from "solid-js";
import {
  appState,
  dismissStory,
  makeChoice,
  resumeGame,
  addNuts,
} from "../engine/state";
import type { CheckpointCondition, StoryChoice } from "../types/story";

/**
 * StoryModal - Displays story checkpoints with choices
 *
 * Features:
 * - Shows story title, body, and character
 * - Displays choices when available
 * - Handles choice requirements
 * - Shows queue status
 * - Auto-dismisses when clicking outside
 */
const StoryModal: Component = () => {
  // Access state from SolidJS store
  const activeStoryId = () => appState.story.activeStory;
  const checkpoints = () => appState.story.checkpoints;
  const storyQueue = () => appState.story.storyQueue;
  const gameState = () => appState.game;

  // Don't render if no active story
  if (!activeStoryId()) return null;

  const checkpoint = () => checkpoints()[activeStoryId()!];
  if (!checkpoint()?.story) return null;

  const story = () => checkpoint()!.story!;

  /**
   * Check if a condition is met
   */
  const checkCondition = (condition: CheckpointCondition): boolean => {
    const { type, value, operator = ">=" } = condition;
    let currentValue: number | string = 0;

    switch (type) {
      case "nuts_collected":
        currentValue = gameState().nutsTotal;
        break;
      case "squirrels_count":
        currentValue = Object.keys(gameState().squirrels).length;
        break;
      case "jobsites_purchased": {
        const productionCount = Object.values(
          gameState().jobSites.production,
        ).reduce((total, jobsite) => total + Math.max(1, jobsite.level), 0);
        const refinementCount = Object.values(
          gameState().jobSites.refinement,
        ).reduce((total, jobsite) => total + Math.max(1, jobsite.level), 0);
        currentValue = productionCount + refinementCount;
        break;
      }
      default:
        return false;
    }

    if (typeof value === "number" && typeof currentValue === "number") {
      switch (operator) {
        case ">=":
          return currentValue >= value;
        case ">":
          return currentValue > value;
        case "==":
          return currentValue === value;
        case "<":
          return currentValue < value;
        case "<=":
          return currentValue <= value;
        default:
          return false;
      }
    }

    return false;
  };

  /**
   * Check if a choice is available based on requirements
   */
  const isChoiceAvailable = (choice: StoryChoice): boolean => {
    if (!choice.requirements) return true;
    return choice.requirements.every((req) => checkCondition(req));
  };

  /**
   * Handle dismissing the story
   */
  const handleDismiss = () => {
    dismissStory();
    if (storyQueue().length === 0) resumeGame();
  };

  /**
   * Handle selecting a choice
   */
  const handleChoice = (choiceId: string) => {
    const choice = story().choices?.find((c) => c.id === choiceId);
    if (choice?.effects?.addNuts) {
      addNuts(choice.effects.addNuts);
    }
    makeChoice(activeStoryId()!, choiceId);
    if (storyQueue().length === 0) resumeGame();
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
          {story().character && (
            <p className="text-xs font-bold tracking-widest text-moss uppercase">
              {story().character.replace("_", " ")}
            </p>
          )}
          <h2 className="font-display text-2xl font-bold">{story().title}</h2>
          <hr className="border-moss/15" />
          <p className="text-base leading-relaxed md:text-lg">{story().body}</p>

          {story().choices && story().choices.length > 0 ? (
            <div className="space-y-3">
              <For each={story().choices}>
                {(choice) => {
                  const available = () => isChoiceAvailable(choice);

                  return (
                    <div className={available() ? "" : "opacity-50"}>
                      <button
                        type="button"
                        className={`btn w-full ${available() ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => available() && handleChoice(choice.id)}
                        disabled={!available()}
                      >
                        {choice.text}
                      </button>
                      {choice.description && (
                        <p className="muted mt-1">
                          {choice.description}
                          {!available() && " (Requirements not met)"}
                        </p>
                      )}
                    </div>
                  );
                }}
              </For>
              {storyQueue().length > 0 && (
                <p className="rounded-md bg-sage/50 p-2 text-center text-xs text-muted italic">
                  {storyQueue().length} more{" "}
                  {storyQueue().length === 1 ? "story" : "stories"} waiting...
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDismiss}
                >
                  Continue
                </button>
              </div>
              {storyQueue().length > 0 && (
                <p className="rounded-md bg-sage/50 p-2 text-center text-xs text-muted italic">
                  {storyQueue().length} more{" "}
                  {storyQueue().length === 1 ? "story" : "stories"} waiting...
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
