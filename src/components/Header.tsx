import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import GameConsole from './GameConsole';
import { formatNumber, formatTime } from '../utils/formatters';

const Header: React.FC = () => {
  const { nutsTotal, nutsAllTime, timer, resources } = useSelector(
    (state: RootState) => state.game
  );

  const hasResources =
    resources &&
    (resources.nutwood > 0 ||
      resources.stone > 0 ||
      resources.bronze > 0 ||
      resources.iron > 0);

  return (
    <header className="flex flex-col gap-4 lg:flex-row">
      <div className="card flex-1 p-4 md:p-5" id="stats">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          <span className="mr-2">🥜</span>
          <span className="text-amber" id="total">
            {formatNumber(nutsTotal)}
          </span>{' '}
          Nuts
        </h1>
        <p className="mt-1 text-xs text-muted" id="debug-total">
          {Math.round(nutsTotal * 1000) / 1000}
        </p>
        <p className="mt-2 text-sm text-muted" id="nuts-running">
          All time: {Math.round(nutsAllTime * 1000) / 1000}
        </p>

        {hasResources && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            {resources.nutwood > 0 && (
              <span>
                🪵 <span className="text-amber">{formatNumber(resources.nutwood)}</span>
              </span>
            )}
            {resources.stone > 0 && (
              <span>
                🪨 <span className="text-amber">{formatNumber(resources.stone)}</span>
              </span>
            )}
            {resources.bronze > 0 && (
              <span>
                🔶 <span className="text-amber">{formatNumber(resources.bronze)}</span>
              </span>
            )}
            {resources.iron > 0 && (
              <span>
                ⚙️ <span className="text-amber">{formatNumber(resources.iron)}</span>
              </span>
            )}
          </div>
        )}

        <p className="mt-3 text-sm font-semibold text-bark" id="clock">
          ⏱️ {formatTime(timer.m, timer.s, timer.ms)}
        </p>
      </div>

      <div className="card flex-1 p-3 md:p-4" id="console">
        <GameConsole />
      </div>
    </header>
  );
};

export default Header;
