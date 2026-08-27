import React from 'react';
import HomeTab from './tabs/HomeTab';
import JobsiteTab from './tabs/JobsiteTab';
import IdeasTab from './tabs/IdeasTab';
import PopulationTab from './tabs/PopulationTab';
import FourthTab from './tabs/FourthTab';
import HibernateTab from './tabs/HibernateTab';
import RefinementTab from './tabs/RefinementTab';

interface TabContentProps {
  activeTab: string;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'jobsites':
        return <JobsiteTab />;
      case 'ideas':
        return <IdeasTab />;
      case 'refinement':
        return <RefinementTab />;
      case 'population':
        return <PopulationTab />;
      case 'fourth':
        return <FourthTab />;
      case 'hibernate':
        return <HibernateTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <main className="card min-h-[60vh] flex-1 overflow-hidden">{renderTabContent()}</main>
  );
};

export default TabContent;
