import React from 'react';

const PopulationTab: React.FC = () => {
  return (
    <div className="tab-panel flex min-h-[50vh] items-center justify-center" id="population-content">
      <div className="panel max-w-md text-center">
        <div className="text-5xl">👥</div>
        <h2 className="section-title mt-3">Population Management</h2>
        <p className="muted mt-2">Coming soon...</p>
        <p className="muted mt-1 text-xs">
          Manage your squirrel colony&apos;s growth, housing, and social dynamics.
        </p>
      </div>
    </div>
  );
};

export default PopulationTab;
