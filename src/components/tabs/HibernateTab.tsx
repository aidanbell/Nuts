import { type Component, Show, createSignal, createMemo } from "solid-js";
import { appState, hibernate } from "../../engine/state";
import { formatNumber } from "../../utils/formatters";

const HibernateTab: Component = () => {
  const nutsAllTime = () => appState.game.nutsAllTime;
  const goldNuts = () => appState.game.goldNuts;
  const [showConfirm, setShowConfirm] = createSignal(false);

  const goldNutReward = createMemo(() =>
    Math.floor((nutsAllTime() / Math.pow(10, 6)) * goldNuts().multi),
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
          Take a long winter's nap and return next season with bonus Gold Nuts!
        </p>
        <p class="muted mt-2">
          Current reward:{" "}
          <strong class="text-gold">
            {formatNumber(goldNutReward())} ⭐ Gold Nuts
          </strong>
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
              ⚠️ This will reset ALL your progress!
            </p>
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
