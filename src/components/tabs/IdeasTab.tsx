import React, { memo, useState } from 'react';
import { useIdeas } from '../../hooks/useIdeas';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Idea } from '../../types/ideas';
import { formatNumber } from '../../utils/formatters';

const categoryStyle: Record<string, string> = {
  production: 'bg-leaf/20 text-moss',
  efficiency: 'bg-amber/15 text-amber',
  capacity: 'bg-amber-light/25 text-bark',
  automation: 'bg-moss/15 text-moss',
  meta: 'bg-danger/15 text-danger',
};

const categoryIcon: Record<string, string> = {
  production: '🏭',
  efficiency: '⚡',
  capacity: '👥',
  automation: '🤖',
  meta: '✨',
};

const getEffectDescription = (idea: Idea): string[] => {
  const effects: string[] = [];
  const e = idea.effects;

  if (e.unlockJobsites) effects.push(`Unlocks: ${e.unlockJobsites.join(', ')}`);
  if (e.unlockBuildings) effects.push(`Unlocks: ${e.unlockBuildings.join(', ')}`);
  if (e.globalEfficiency)
    effects.push(`+${(e.globalEfficiency * 100).toFixed(0)}% Global Efficiency`);
  if (e.unlockSquirrelCapacity)
    effects.push(`+${e.unlockSquirrelCapacity} Squirrel Capacity`);
  if (e.reduceJobsiteCost)
    effects.push(`-${(e.reduceJobsiteCost * 100).toFixed(0)}% Jobsite Costs`);
  if (e.upgradeJobsite) {
    effects.push(
      `+${e.upgradeJobsite.amount} ${e.upgradeJobsite.property} ${e.upgradeJobsite.jobsiteId}`
    );
  }

  return effects;
};

interface IdeaCardProps {
  idea: Idea;
  onResearch: () => void;
  canAfford: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onResearch,
  canAfford,
  isExpanded,
  onToggle,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onToggle();
    }}
    className={[
      'cursor-pointer rounded-xl border-2 p-4 transition hover:-translate-y-0.5',
      canAfford && !idea.researched ? 'opacity-100' : 'opacity-70',
      isExpanded ? 'border-moss bg-sage/40' : 'border-moss/15 bg-white/70 hover:border-moss/40',
    ].join(' ')}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block text-sm transition ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
        <span className="text-xl">{categoryIcon[idea.category] ?? '💡'}</span>
        <h3 className="font-display text-base font-bold">{idea.name}</h3>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right text-xs font-semibold">
        {idea.researched && (
          <span className="rounded-full bg-leaf/25 px-2 py-0.5 text-moss">✓</span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 ${categoryStyle[idea.category] ?? 'bg-sage text-bark'}`}
        >
          {idea.category.charAt(0).toUpperCase()}
        </span>
        <span>
          🥜 {formatNumber(idea.cost.nuts || 0)}
          {idea.cost.nutwood ? ` · 🪵 ${formatNumber(idea.cost.nutwood)}` : ''}
          {idea.cost.stone ? ` · 🪨 ${formatNumber(idea.cost.stone)}` : ''}
        </span>
      </div>
    </div>

    {isExpanded && (
      <div className="mt-3 space-y-3 border-t border-moss/10 pt-3">
        <p className="muted">{idea.description}</p>
        <div>
          <p className="text-sm font-semibold">Effects</p>
          <ul className="mt-1 space-y-0.5 text-sm text-muted">
            {getEffectDescription(idea).map((effect) => (
              <li key={effect}>• {effect}</li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className={`btn btn-sm ${canAfford && !idea.researched ? 'btn-primary' : 'btn-secondary'}`}
          disabled={idea.researched || !canAfford}
          onClick={(e) => {
            e.stopPropagation();
            onResearch();
          }}
        >
          {idea.researched ? 'Researched' : canAfford ? 'Research' : 'Not Enough Nuts'}
        </button>
      </div>
    )}
  </div>
);

const eraOrder = [
  'PREHISTORY',
  'WOOD_AGE',
  'STONE_AGE',
  'BRONZE_AGE',
  'IRON_AGE',
  'INDUSTRIAL_AGE',
  'INFORMATION_AGE',
  'TECHNOLOGY_AGE',
  'SPACE_AGE',
  'GALACTIC_AGE',
];

const IdeasTab: React.FC = () => {
  const { visibleIdeas, researchedIdeas, canAfford, research } = useIdeas();
  const nutsTotal = useSelector((state: RootState) => state.game.nutsTotal);
  const currentEra = useSelector((state: RootState) => state.story.currentEra);
  const [showResearched, setShowResearched] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);

  const ideasByEra = visibleIdeas.reduce(
    (acc, idea) => {
      if (!acc[idea.era]) acc[idea.era] = [];
      acc[idea.era].push(idea);
      return acc;
    },
    {} as Record<string, Idea[]>
  );

  const currentEraIndex = eraOrder.indexOf(currentEra || 'PREHISTORY');
  const erasToShow = eraOrder.slice(0, currentEraIndex + 1);
  const filteredVisible = visibleIdeas.filter((idea) => showResearched || !idea.researched);

  return (
    <div className="tab-panel space-y-5" id="ideas-content">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="section-title">💡 Ideas & Research</h2>
        <div className="space-y-1 text-right text-sm">
          {currentEra && (
            <p className="muted">
              Era: <strong className="text-bark">{currentEra.replace('_', ' ')}</strong>
            </p>
          )}
          <p className="muted">
            Researched:{' '}
            <strong className="text-bark">
              {researchedIdeas.length} / {visibleIdeas.length}
            </strong>
          </p>
          <p className="font-semibold">🥜 {formatNumber(nutsTotal)}</p>
          <label className="flex items-center justify-end gap-2 text-sm">
            Show researched
            <input
              type="checkbox"
              checked={showResearched}
              onChange={() => setShowResearched(!showResearched)}
              className="size-4 accent-moss"
            />
          </label>
        </div>
      </div>

      <hr className="border-moss/15" />

      {filteredVisible.length === 0 && (
        <div className="panel text-center">
          <p className="text-lg">🔒 No ideas available yet</p>
          <p className="muted mt-1">
            Keep gathering nuts and growing your colony to unlock research.
          </p>
        </div>
      )}

      {erasToShow.map((era) => {
        const eraIdeas = ideasByEra[era];
        if (!eraIdeas?.length) return null;

        const filteredIdeas = eraIdeas.filter((idea) => showResearched || !idea.researched);
        const researchedCount = eraIdeas.filter((idea) => idea.researched).length;

        return (
          <section key={era} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{era.replace('_', ' ')}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  researchedCount === eraIdeas.length
                    ? 'bg-leaf/25 text-moss'
                    : 'bg-sage text-bark'
                }`}
              >
                {researchedCount} / {eraIdeas.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onResearch={() => research(idea.id)}
                  canAfford={canAfford(idea)}
                  isExpanded={expandedIdea === idea.id}
                  onToggle={() =>
                    setExpandedIdea(expandedIdea === idea.id ? null : idea.id)
                  }
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default memo(IdeasTab);
