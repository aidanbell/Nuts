import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setActiveTab } from '../store/gameSlice';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const NavContainer = styled.nav`
  display: flex;
  width: 200px;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
`;

const TabButton = styled.button<{ $active: boolean }>`
  border: 2px solid ${({ $active }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active }) => $active ? 'white' : theme.colors.text};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${({ $active }) => $active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  height: 50px;
  text-align: center;
  min-width: 140px;
  width: 100%;
  padding: 0 ${theme.spacing.md};
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  box-shadow: ${({ $active }) => $active ? theme.shadows.md : theme.shadows.sm};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.hover};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.typography.fontSize.md};
    height: 44px;
    min-width: 120px;
    padding: 0 ${theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.typography.fontSize.sm};
    height: 40px;
    min-width: 100px;
  }
`;

const Navigation: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.game.activeTab);
  const unlockedTabs = useSelector((state: RootState) => state.game.unlockedTabs);
  
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'jobsites', label: 'Jobsites' },
    { id: 'refinement', label: 'Refinement' },
    { id: 'population', label: 'Population' },
    { id: 'fourth', label: 'Fourth' },
    { id: 'hibernate', label: 'Hibernate!' },
  ];
  
  const handleTabClick = (tabId: string) => {
    dispatch(setActiveTab(tabId));
  };
  
  return (
    <NavContainer>
      {tabs
        .filter(tab => unlockedTabs.includes(tab.id))
        .map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
    </NavContainer>
  );
};

export default Navigation;

