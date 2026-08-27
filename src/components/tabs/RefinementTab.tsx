import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { craftRefinement } from '../../store/gameSlice';
import { refinementJobsites } from '../../data/jobsites';
import { formatNumber } from '../../utils/formatters';

const RefinementTab: React.FC = () => {
  const dispatch = useDispatch();
  const { nutsTotal, resources } = useSelector((state: RootState) => state.game);

  const nutwoodRefinement = refinementJobsites.find((js) => js.id === 'nutwoodRefinement');

  if (!nutwoodRefinement?.consumes || !nutwoodRefinement.produces) {
    return (
      <div className="tab-panel space-y-3">
        <h2 className="section-title">🏭 Refinement</h2>
        <div className="panel">
          <p>No refinements available yet.</p>
        </div>
      </div>
    );
  }

  const { resource: consumeType, amount: consumeAmount } = nutwoodRefinement.consumes;
  const { resource: produceType, amount: produceAmount } = nutwoodRefinement.produces;
  const availableResource =
    consumeType === 'nuts' ? nutsTotal : resources[consumeType as keyof typeof resources];
  const hasEnoughResources = availableResource >= consumeAmount;

  return (
    <div className="tab-panel space-y-4" id="refinement-content">
      <div>
        <h2 className="section-title">🏭 Manual Refinement</h2>
        <p className="muted mt-1">
          Refine raw materials into useful resources. Later you&apos;ll unlock automated
          refineries.
        </p>
      </div>

      <div className="card max-w-xl p-5">
        <h3 className="font-display text-lg font-bold">🪵 Craft NutWood</h3>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div
            className={[
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
              hasEnoughResources
                ? 'border-moss/20 bg-white/80'
                : 'border-danger/40 bg-danger/10 text-danger',
            ].join(' ')}
          >
            {consumeType === 'nuts' ? '🥜' : '❓'}
            <strong>{consumeAmount}</strong> {consumeType}
            <span className="text-xs text-muted">
              ({formatNumber(availableResource)} available)
            </span>
          </div>
          <span className="text-xl text-muted">→</span>
          <div className="flex items-center gap-2 rounded-lg border border-moss/20 bg-white/80 px-3 py-2 text-sm">
            🪵 <strong>{produceAmount}</strong> {produceType}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg mt-4"
          onClick={() => dispatch(craftRefinement({ refinementId: 'nutwoodRefinement' }))}
          disabled={!hasEnoughResources}
        >
          Craft NutWood
        </button>

        {!hasEnoughResources && (
          <p className="mt-3 text-sm text-danger">
            ⚠️ Not enough {consumeType}! Need {consumeAmount - availableResource} more.
          </p>
        )}
      </div>
    </div>
  );
};

export default RefinementTab;
