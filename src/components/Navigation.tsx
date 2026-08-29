import { type Component, For } from "solid-js";
import { appState, setActiveTab } from "../engine/state";

const tabs = [
  { id: "home", label: "Home" },
  { id: "ideas", label: "Ideas" },
  { id: "jobsites", label: "Jobsites" },
  { id: "refinement", label: "Refinement" },
  { id: "buildings", label: "Buildings" },
  { id: "population", label: "Population" },
  { id: "fourth", label: "Fourth" },
  { id: "hibernate", label: "Hibernate!" },
];

const Navigation: Component = () => {
  const activeTab = () => appState.game.activeTab;
  const unlockedTabs = () => appState.game.unlockedTabs;

  const visibleTabs = () =>
    tabs.filter((tab) => unlockedTabs().includes(tab.id));

  return (
    <nav class="flex w-full shrink-0 flex-row flex-wrap gap-2 md:w-44 md:flex-col">
      <For each={visibleTabs()}>
        {(tab) => {
          const active = () => activeTab() === tab.id;

          return (
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              class={[
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
