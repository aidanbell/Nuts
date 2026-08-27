import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import TabContent from './TabContent';
import GoldenNut from './GoldenNut';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useGoldenNut } from '../hooks/useGoldenNut';

const GameContainer: React.FC = () => {
  const activeTab = useSelector((state: RootState) => state.game.activeTab);
  const { goldenNut, collectGoldenNut, fadeMs } = useGoldenNut();

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
      <Header />
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-5">
        <Navigation />
        <TabContent activeTab={activeTab} />
      </div>
      {goldenNut && (
        <GoldenNut
          key={`${goldenNut.id}-${goldenNut.expiresAt}`}
          nut={goldenNut}
          fadeMs={fadeMs}
          lifetimeMs={goldenNut.durationMs}
          onCollect={collectGoldenNut}
        />
      )}
    </div>
  );
};

export default GameContainer;
