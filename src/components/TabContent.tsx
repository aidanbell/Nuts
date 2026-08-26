import React from 'react';
import HomeTab from './tabs/HomeTab';
import JobsiteTab from './tabs/JobsiteTab';
import IdeasTab from './tabs/IdeasTab';
import PopulationTab from './tabs/PopulationTab';
import FourthTab from './tabs/FourthTab';
import HibernateTab from './tabs/HibernateTab';
import RefinementTab from './tabs/RefinementTab';
import styled from 'styled-components';
import { theme } from '../styles/theme';

interface TabContentProps {
  activeTab: string;
}

const MainContent = styled.main`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    border-radius: ${theme.borderRadius.md};
  }
`;

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
    <MainContent>
      {renderTabContent()}
    </MainContent>
  );
};

export default TabContent;

