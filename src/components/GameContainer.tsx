import { type Component, Show } from "solid-js";
import Header from "./Header";
import Navigation from "./Navigation";
import TabContent from "./TabContent";
import GoldenNut from "./GoldenNut";
import { appState } from "../engine/state";
import { createGoldenNut } from "./createGoldenNut";

const GameContainer: Component = () => {
  const activeTab = () => appState.game.activeTab;
  const { goldenNut, collectGoldenNut, fadeMs } = createGoldenNut();

  return (
    <div class="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
      <Header />
      <div class="mt-4 flex flex-col gap-4 md:flex-row md:gap-5">
        <Navigation />
        <TabContent activeTab={activeTab()} />
      </div>
      <Show when={goldenNut()}>
        {(gn) => (
          <GoldenNut
            nut={gn()}
            fadeMs={fadeMs}
            lifetimeMs={gn().durationMs}
            onCollect={collectGoldenNut}
          />
        )}
      </Show>
    </div>
  );
};

export default GameContainer;
