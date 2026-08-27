/**
 * Navigation Component - SolidJS Version
 *
 * Displays navigation tabs for different game sections.
 * Only shows tabs that have been unlocked.
 *
 * Migration notes:
 * - Replaced React.FC with SolidJS Component type
 * - Replaced useSelector/useDispatch with direct appState/setAppState access
 * - Replaced .map() with SolidJS <For> component for efficient list rendering
 * - Replaced onClick with onClick (same syntax in SolidJS)
 *
 * TODO: AGENT - Consider extracting tab definitions to a config file
 */

import { type Component, For, createSignal } from "solid-js";
import { appState, setActiveTab } from "../engine/state";

// Tab definitions - could be moved to a config file
const tabs = [
  { id: "home", label: "Home" },
  { id: "ideas", label: "Ideas" },
  { id: "jobsites", label: "Jobsites" },
  { id: "refinement", label: "Refinement" },
  { id: "population", label: "Population" },
  { id: "fourth", label: "Fourth" },
  { id: "hibernate", label: "Hibernate!" },
];

/**
 * Navigation - Tab navigation for game sections
 *
 * Features:
 * - Shows only unlocked tabs
 * - Highlights active tab
 * - Responsive layout (row on mobile, column on desktop)
 */
const Navigation: Component = () => {
  // Access state directly from SolidJS store
  const activeTab = () => appState.game.activeTab;
  const unlockedTabs = () => appState.game.unlockedTabs;

  // Filter tabs to only show unlocked ones
  const visibleTabs = () =>
    tabs.filter((tab) => unlockedTabs().includes(tab.id));

  return (
    <nav className="flex w-full shrink-0 flex-row flex-wrap gap-2 md:w-44 md:flex-col">
      <For each={visibleTabs()}>
        {(tab) => {
          const active = () => activeTab() === tab.id;

          return (
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-lg border px-3 py-2.5 text-sm font-semibold transition md:w-full md:text-base",
                active()
                  ? "border-moss bg-moss text-white shadow-md"
                  : "border-moss/20 bg-paper/80 text-bark hover:-translate-y-0.5 hover:border-moss/40 hover:bg-white",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        }}
      </For>
    </nav>
  );
};

export default Navigation;
