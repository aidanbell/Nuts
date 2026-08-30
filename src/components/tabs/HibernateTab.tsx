import { type Component, Show, createSignal, createMemo } from "solid-js";
import {
  appState,
  hibernate,
  calculateHibernationReward,
} from "../../engine/state";
import { formatNumber } from "../../utils/formatters";

const HibernateTab: Component = () => {
  const goldNuts = () => appState.game.goldNuts;
  const nutsThisSeason = () => appState.game.nutsAllTime;
  const meta = () => appState.meta;
  const [showConfirm, setShowConfirm] = createSignal(false);

  const goldNutReward = createMemo(() =>
    calculateHibernationReward(nutsThisSeason(), goldNuts().multi),
  );

  const handleConfirmHibernate = () => {
    hibernate();
    setShowConfirm(false);
  };

  return (
    <div
      class="tab-panel flex min-h-[60vh] items-center justify-center"
      id="hibernate-content"
    >
      <div class="panel w-full max-w-lg text-center">
        <h1 class="font-display text-3xl font-bold">💤 Hibernate</h1>
        <p class="mt-3 text-base">
          Winter takes the clearing — nuts, squirrels, and jobsites. You keep
          Gold Nuts, and wake stronger next season.
        </p>

        <Show when={meta().winterIncoming}>
          <p class="mt-3 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-sm font-semibold text-amber">
            Winter is here. The longer you wait, the colder the clearing gets —
            but the den will not survive either way.
          </p>
        </Show>

        <p class="muted mt-3">
          Season {meta().seasonIndex + 1} · Winters survived:{" "}
          {meta().hibernations}
        </p>
        <p class="muted mt-1">
          Nuts this season: <strong>🥜 {formatNumber(nutsThisSeason())}</strong>
        </p>
        <p class="muted mt-1">
          Current reward:{" "}
          <strong class="text-gold">
            {formatNumber(goldNutReward())} ⭐ Gold Nuts
          </strong>
        </p>
        <p class="muted mt-1 text-xs">
          Gold Nuts scale with nuts gathered this season. Banked Gold boosts all
          production next season (+
          {((meta().goldForageMulti - 1) * 100).toFixed(0)}% now
          {goldNutReward() > 0
            ? `, +${(goldNutReward() * 2).toFixed(0)}% after`
            : ""}
          ).
        </p>

        <button
          type="button"
          class="btn btn-warning btn-lg mt-6"
          onClick={() => setShowConfirm(true)}
        >
          💤 HIBERNATE NOW
        </button>

        <Show when={showConfirm()}>
          <div class="mt-6 rounded-xl border border-amber/40 bg-amber/10 p-4 text-left">
            <h3 class="font-display text-lg font-bold">⚠️ Are you sure?</h3>
            <p class="mt-2">If you hibernate, you will receive:</p>
            <p
              class="my-4 text-center font-display text-3xl font-bold text-gold"
              id="gn-preview"
            >
              ⭐ {formatNumber(goldNutReward())} Gold Nuts
            </p>
            <p class="text-sm font-bold text-danger">
              ⚠️ This wipes nuts, squirrels, jobsites, and research for this
              season!
            </p>
            <Show when={meta().hibernations === 0}>
              <p class="muted mt-2 text-sm">
                Next spring, Scavenger routes and NutWood craft open up.
              </p>
            </Show>
            <Show when={meta().hibernations === 1}>
              <p class="muted mt-2 text-sm">
                Next spring, with more Gold, you can stockpile NutWood and
                research The Wood Age.
              </p>
            </Show>
            <div class="mt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                class="btn btn-danger btn-lg"
                onClick={handleConfirmHibernate}
              >
                ✓ Confirm Hibernate
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-lg"
                onClick={() => setShowConfirm(false)}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default HibernateTab;
