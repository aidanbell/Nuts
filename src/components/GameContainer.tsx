/**
 * GameContainer Component - SolidJS Version
 *
 * Main container for the game UI, including header, navigation, tabs, and golden nut.
 *
 * Migration notes:
 * - Replaced React.FC with SolidJS Component type
 * - Replaced useSelector with direct appState access
 * - Replaced useGoldenNut with useSolidGoldenNut from engine
 * - Replaced React fragments with SolidJS fragments
 * - GoldenNut component already converted to SolidJS
 *
 * TODO: AGENT - Consider using <Show> component for conditional rendering
 * if we want to leverage SolidJS's fine-grained reactivity more
 */

import {
  type Component,
  createSignal,
  onCleanup,
  createEffect,
} from "solid-js";
import Header from "./Header";
import Navigation from "./Navigation";
import TabContent from "./TabContent";
import GoldenNut from "./GoldenNut";
import { appState } from "../engine/state";
import { useSolidGoldenNut } from "../engine/hooks";

/**
 * GameContainer - Main game UI container
 *
 * Contains:
 * - Header with game info
 * - Navigation for tabs
 * - TabContent for active tab
 * - GoldenNut when available
 */
const GameContainer: Component = () => {
  // Get active tab from SolidJS store
  const activeTab = () => appState.game.activeTab;

  // Use SolidJS golden nut hook
  const { goldenNut, collectGoldenNut, fadeMs } = useSolidGoldenNut();

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
      <Header />
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-5">
        <Navigation />
        <TabContent activeTab={activeTab()} />
      </div>
      {/* Render GoldenNut when available */}
      {goldenNut() && (
        <GoldenNut
          key={`${goldenNut()!.id}-${goldenNut()!.expiresAt}`}
          nut={goldenNut()!}
          fadeMs={fadeMs}
          lifetimeMs={goldenNut()!.durationMs}
          onCollect={collectGoldenNut}
        />
      )}
    </div>
  );
};

export default GameContainer;
