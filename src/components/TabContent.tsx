/**
 * Renders the active tab panel.
 */

import { type Component, Switch, Match } from "solid-js";
import HomeTab from "./tabs/HomeTab";
import JobsiteTab from "./tabs/JobsiteTab";
import IdeasTab from "./tabs/IdeasTab";
import PopulationTab from "./tabs/PopulationTab";
import TownTab from "./tabs/TownTab";
import FourthTab from "./tabs/FourthTab";
import HibernateTab from "./tabs/HibernateTab";
import RefinementTab from "./tabs/RefinementTab";
import { TOWN_TAB_ID } from "../data/town";

interface TabContentProps {
  activeTab: string;
}

const TabContent: Component<TabContentProps> = (props) => {
  return (
    <main class="card min-h-[50vh] flex-1 overflow-hidden">
      <Switch fallback={<HomeTab />}>
        <Match when={props.activeTab === "home"}>
          <HomeTab />
        </Match>
        <Match when={props.activeTab === "jobsites"}>
          <JobsiteTab />
        </Match>
        <Match when={props.activeTab === "ideas"}>
          <IdeasTab />
        </Match>
        <Match when={props.activeTab === "refinement"}>
          <RefinementTab />
        </Match>
        <Match when={props.activeTab === TOWN_TAB_ID}>
          <TownTab />
        </Match>
        <Match when={props.activeTab === "population"}>
          <PopulationTab />
        </Match>
        <Match when={props.activeTab === "fourth"}>
          <FourthTab />
        </Match>
        <Match when={props.activeTab === "hibernate"}>
          <HibernateTab />
        </Match>
      </Switch>
    </main>
  );
};

export default TabContent;
