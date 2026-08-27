import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setActiveTab } from "../store/gameSlice";

const tabs = [
  { id: "home", label: "Home" },
  { id: "ideas", label: "Ideas" },
  { id: "jobsites", label: "Jobsites" },
  { id: "refinement", label: "Refinement" },
  { id: "population", label: "Population" },
  { id: "fourth", label: "Fourth" },
  { id: "hibernate", label: "Hibernate!" },
];

const Navigation: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.game.activeTab);
  const unlockedTabs = useSelector(
    (state: RootState) => state.game.unlockedTabs,
  );

  return (
    <nav className="flex w-full shrink-0 flex-row flex-wrap gap-2 md:w-44 md:flex-col">
      {tabs
        .filter((tab) => unlockedTabs.includes(tab.id))
        .map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={[
                "rounded-lg border px-3 py-2.5 text-sm font-semibold transition md:w-full md:text-base",
                active
                  ? "border-moss bg-moss text-white shadow-md"
                  : "border-moss/20 bg-paper/80 text-bark hover:-translate-y-0.5 hover:border-moss/40 hover:bg-white",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
    </nav>
  );
};

export default Navigation;
