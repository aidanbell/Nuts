/**
 * TabContent Component - SolidJS Version
 *
 * Renders the appropriate tab content based on the active tab.
 *
 * Migration notes:
 * - Replaced React.FC with SolidJS Component type
 * - Replaced props destructuring with direct props access
 * - Replaced render function with SolidJS <Switch> for efficient conditional rendering
 * - All tab components remain unchanged (still React for now)
 *
 * TODO: AGENT - Convert all tab components to SolidJS
 * TODO: AGENT - Consider using <Switch> and <Match> from solid-js for cleaner pattern matching
 */

import { type Component, Switch, Match } from "solid-js";
import HomeTab from "./tabs/HomeTab";
import JobsiteTab from "./tabs/JobsiteTab";
import IdeasTab from "./tabs/IdeasTab";
import PopulationTab from "./tabs/PopulationTab";
import FourthTab from "./tabs/FourthTab";
import HibernateTab from "./tabs/HibernateTab";
import RefinementTab from "./tabs/RefinementTab";

interface TabContentProps {
  activeTab: string;
}

/**
 * TabContent - Renders the active tab's content
 *
 * Uses SolidJS <Switch> for efficient conditional rendering.
 * Only the active tab component is rendered, improving performance.
 *
 * @param activeTab - The currently active tab ID
 */
const TabContent: Component<TabContentProps> = (props) => {
  return (
    <main className="card min-h-[60vh] flex-1 overflow-hidden">
      <Switch>
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
        <Match when={props.activeTab === "population"}>
          <PopulationTab />
        </Match>
        <Match when={props.activeTab === "fourth"}>
          <FourthTab />
        </Match>
        <Match when={props.activeTab === "hibernate"}>
          <HibernateTab />
        </Match>
        {/* Default to home tab */}
        <Match when={true}>
          <HomeTab />
        </Match>
      </Switch>
    </main>
  );
};

export default TabContent;
