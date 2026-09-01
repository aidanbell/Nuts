import type { Component } from "solid-js";
import { appState, getEffectiveNps } from "../engine/state";
import { formatEraName } from "../data/eras";
import {
  formatNumber,
  formatProductionRate,
  formatTime,
} from "../utils/formatters";

const App: Component = () => {
  const nutsTotal = () => appState.game.nutsTotal;
  const nutsAllTime = () => appState.game.nutsAllTime;
  const squirrelCount = () => Object.keys(appState.game.squirrels).length;
  const era = () => formatEraName(appState.story.currentEra);
  const season = () => appState.meta.seasonIndex + 1;
  const timer = () => appState.game.timer;

  return (
    <box flexDirection="column" padding={1} width="100%" height="100%">
      <box
        border
        title="Nuts"
        titleAlignment="center"
        flexDirection="column"
        padding={1}
        width={44}
      >
        <text content={`Nuts:      ${formatNumber(nutsTotal())}`} fg="#e0a030" />
        <text content={`All time:  ${formatNumber(nutsAllTime())}`} />
        <text content={`Rate:      ${formatProductionRate(getEffectiveNps())}`} />
        <text content={`Squirrels: ${squirrelCount()}`} />
        <text content={`Era:       ${era()}`} />
        <text content={`Season:    ${season()}`} />
        <text
          content={`Clock:     ${formatTime(timer().m, timer().s, timer().ms)}`}
        />
      </box>
      <text content="Ctrl+C to save and quit." fg="#888888" />
    </box>
  );
};

export default App;
