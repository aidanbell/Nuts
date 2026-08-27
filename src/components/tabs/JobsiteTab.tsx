import React, { useState, memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  buyJobSiteCapacity,
  assignSquirrelToJobSite,
  removeSquirrelFromJobSite,
} from "../../store/gameSlice";
import { formatNumber, formatProductionRate } from "../../utils/formatters";
import SquirrelDisplay from "../SquirrelDisplay";

interface JobSiteCardProps {
  jobSiteId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const JobSiteCardComponent: React.FC<JobSiteCardProps> = memo(
  ({ jobSiteId, isExpanded, onToggle }) => {
    const dispatch = useDispatch();
    const jobSites = useSelector((state: RootState) => state.game.jobSites);
    const nuts = useSelector((state: RootState) => state.game.nutsTotal);
    const jobless = useSelector(
      (state: RootState) => state.game.population.jobless,
    );

    const jobSite =
      jobSites.production[jobSiteId] || jobSites.refinement[jobSiteId];

    const handleBuy = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(buyJobSiteCapacity(jobSiteId));
      },
      [dispatch, jobSiteId],
    );

    const handleAddWorker = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (jobless.length > 0) {
          dispatch(
            assignSquirrelToJobSite({ squirrelId: jobless[0], jobSiteId }),
          );
        }
      },
      [dispatch, jobSiteId, jobless],
    );

    const handleRemoveWorker = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (jobSite?.workers && jobSite.workers.length > 0) {
          dispatch(
            removeSquirrelFromJobSite({
              squirrelId: jobSite.workers[0],
              jobSiteId,
            }),
          );
        }
      },
      [dispatch, jobSiteId, jobSite?.workers],
    );

    if (!jobSite) return null;

    const canAfford = nuts >= jobSite.cost;
    const canAddWorker =
      jobSite.workers.length < jobSite.maxSquirrels && jobless.length > 0;
    const canRemoveWorker = jobSite.workers.length > 0;
    const totalRate =
      (jobSite.baseProduction +
        jobSite.squirrelBonus * jobSite.workers.length) *
      jobSite.multi;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className={[
          "cursor-pointer rounded-xl border-2 p-4 transition hover:-translate-y-0.5",
          isExpanded
            ? "border-moss bg-sage/40"
            : "border-moss/15 bg-white/70 hover:border-moss/40",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block transition ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▼
            </span>
            <span className="font-display text-lg font-semibold">
              {jobSite.name}
            </span>
          </div>
          <div className="flex gap-3 text-sm font-semibold">
            <span>
              👥 {jobSite.workers.length}/{jobSite.maxSquirrels}
            </span>
            <span>Lv.{jobSite.level}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3 border-t border-moss/10 pt-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="muted">Total Production</p>
                <p className="font-display text-xl font-bold">
                  {formatProductionRate(totalRate)}
                </p>
              </div>
              <div>
                <p className="muted">Base</p>
                <p>
                  {formatProductionRate(jobSite.baseProduction * jobSite.multi)}
                </p>
              </div>
              <div>
                <p className="muted">Per Squirrel</p>
                <p>
                  +{formatProductionRate(jobSite.squirrelBonus * jobSite.multi)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddWorker}
                  disabled={!canAddWorker}
                >
                  + Assign
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRemoveWorker}
                  disabled={!canRemoveWorker}
                >
                  - Remove
                </button>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className={`btn btn-sm ${canAfford ? "btn-primary" : "btn-secondary"}`}
                  onClick={handleBuy}
                  disabled={!canAfford}
                >
                  Upgrade
                </button>
                <p className="mt-1 text-sm font-semibold">
                  🥜 {formatNumber(jobSite.cost)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

JobSiteCardComponent.displayName = "JobSiteCardComponent";

const JobsiteTab: React.FC = () => {
  const [expandedJobSite, setExpandedJobSite] = useState<string | null>(null);
  const jobSites = useSelector((state: RootState) => state.game.jobSites);
  const population = useSelector((state: RootState) => state.game.population);

  const jobSiteArray = [
    ...Object.values(jobSites.production),
    ...Object.values(jobSites.refinement),
  ];

  return (
    <div className="tab-panel space-y-6" id="jobsite-content">
      <section>
        <h2 className="section-title">👷 Available Workers</h2>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {population.jobless.map((squirrelId) => (
            <SquirrelDisplay
              key={squirrelId}
              squirrelId={squirrelId}
              showNutFinding={false}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold">🏭 Job Sites</h3>
        {jobSiteArray.map((jobSite) => (
          <JobSiteCardComponent
            key={jobSite.id}
            jobSiteId={jobSite.id}
            isExpanded={expandedJobSite === jobSite.id}
            onToggle={() =>
              setExpandedJobSite(
                expandedJobSite === jobSite.id ? null : jobSite.id,
              )
            }
          />
        ))}
      </section>
    </div>
  );
};

export default memo(JobsiteTab);
