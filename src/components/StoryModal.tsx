import {
  type Component,
  Show,
  For,
} from "solid-js";
import {
  appState,
  dismissStory,
  makeChoice,
  resumeGame,
  addNuts,
} from "../engine/state";
import type { CheckpointCondition, StoryChoice } from "../types/story";

const StoryModal: Component = () => {
  const activeStoryId = () => appState.story.activeStory;
  const checkpoints = () => appState.story.checkpoints;
  const storyQueue = () => appState.story.storyQueue;
  const gameState = () => appState.game;

  const checkpoint = () => {
    const id = activeStoryId();
    if (!id) return undefined;
    return checkpoints()[id];
  };

  const story = () => checkpoint()?.story;

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

  const isChoiceAvailable = (choice: StoryChoice): boolean => {
    if (!choice.requirements) return true;
    return choice.requirements.every((req) => checkCondition(req));
  };

  const handleDismiss = () => {
    dismissStory();
    if (storyQueue().length === 0) resumeGame();
  };

  const handleChoice = (choiceId: string) => {
    const id = activeStoryId();
    const currentStory = story();
    if (!id || !currentStory) return;

    const choice = currentStory.choices?.find((c) => c.id === choiceId);
    if (choice?.effects?.addNuts) {
      addNuts(choice.effects.addNuts);
    }
    makeChoice(id, choiceId);
    if (storyQueue().length === 0) resumeGame();
  };

  const hasChoices = () => {
    const s = story();
    return Boolean(s?.choices && s.choices.length > 0);
  };

  return (
    <Show when={activeStoryId() && story()}>
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-bark/70 p-4"
        onClick={handleDismiss}
      >
        <div
          class="card max-h-[80vh] w-full max-w-xl overflow-y-auto p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="space-y-4">
            <Show when={story()?.character}>
              {(character) => (
                <p class="text-xs font-bold tracking-widest text-moss uppercase">
                  {character().replace("_", " ")}
                </p>
              )}
            </Show>
            <h2 class="font-display text-2xl font-bold">
              {story()!.title}
            </h2>
            <hr class="border-moss/15" />
            <p class="text-base leading-relaxed md:text-lg">
              {story()!.body}
            </p>

            <Show
              when={hasChoices()}
              fallback={
                <>
                  <div class="flex justify-end">
                    <button
                      type="button"
                      class="btn btn-primary"
                      onClick={handleDismiss}
                    >
                      Continue
                    </button>
                  </div>
                  <Show when={storyQueue().length > 0}>
                    <p class="rounded-md bg-sage/50 p-2 text-center text-xs text-muted italic">
                      {storyQueue().length} more{" "}
                      {storyQueue().length === 1 ? "story" : "stories"}{" "}
                      waiting...
                    </p>
                  </Show>
                </>
              }
            >
              <div class="space-y-3">
                <For each={story()!.choices}>
                  {(choice) => {
                    const available = () => isChoiceAvailable(choice);

                    return (
                      <div class={available() ? "" : "opacity-50"}>
                        <button
                          type="button"
                          class={`btn w-full ${available() ? "btn-primary" : "btn-secondary"}`}
                          onClick={() =>
                            available() && handleChoice(choice.id)
                          }
                          disabled={!available()}
                        >
                          {choice.text}
                        </button>
                        <Show when={choice.description}>
                          <p class="muted mt-1">
                            {choice.description}
                            <Show when={!available()}>
                              {" (Requirements not met)"}
                            </Show>
                          </p>
                        </Show>
                      </div>
                    );
                  }}
                </For>
                <Show when={storyQueue().length > 0}>
                  <p class="rounded-md bg-sage/50 p-2 text-center text-xs text-muted italic">
                    {storyQueue().length} more{" "}
                    {storyQueue().length === 1 ? "story" : "stories"} waiting...
                  </p>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default StoryModal;
