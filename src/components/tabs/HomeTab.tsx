import React, { memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import SquirrelDisplay from "../SquirrelDisplay";
import { setEra } from "../../store/storySlice";

const HomeTab: React.FC = () => {
  const dispatch = useDispatch();
  const joblessSquirrels = useSelector(
    (state: RootState) => state.game.population.jobless,
  );
  const currentEra = useSelector((state: RootState) => state.story.currentEra);
  const unlockedTabs = useSelector(
    (state: RootState) => state.game.unlockedTabs,
  );
  const nutsTotal = useSelector((state: RootState) => state.game.nutsTotal);

  const handleAdvanceEra = () => {
    if (currentEra === "PREHISTORY") {
      dispatch(setEra("WOOD_AGE"));
    }
  };

  const canAdvanceToWoodAge =
    unlockedTabs.includes("eras") && currentEra === "PREHISTORY";

  return (
    <div className="tab-panel space-y-6" id="home-content">
      {unlockedTabs.includes("eras") && (
        <section className="space-y-3">
          <h2 className="section-title">Current Era</h2>
          <p className="font-display text-lg font-semibold">
            {currentEra?.replace(/_/g, " ") || "PREHISTORY"}
          </p>

          {canAdvanceToWoodAge && (
            <div className="panel border-leaf/30 bg-leaf/10">
              <h3 className="font-display text-lg font-bold">
                🌳 The Wood Age Awaits
              </h3>
              <p className="muted mt-2">
                Your squirrels have discovered refined materials! Choose when
                you&apos;re ready to advance.
              </p>
              <p className="muted mt-2">
                <strong>Tip:</strong> Gather more nuts before advancing. Current
                nuts: {nutsTotal.toLocaleString()}
              </p>
              <button
                type="button"
                className="btn btn-success btn-lg mt-4"
                onClick={handleAdvanceEra}
              >
                Advance to Wood Age →
              </button>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="section-title">Population</h2>
        <p className="muted mt-1">
          {joblessSquirrels.length} jobless squirrels
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2" id="jobless">
          {joblessSquirrels.map((squirrelId) => (
            <SquirrelDisplay
              key={squirrelId}
              squirrelId={squirrelId}
              showNutFinding
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default memo(HomeTab);
