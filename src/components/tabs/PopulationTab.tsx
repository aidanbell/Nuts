import React from 'react';
import styled from 'styled-components';
import { TabContainer, Column, Heading2, Text, Card } from '../../styles/components';
import { theme } from '../../styles/theme';


const ComingSoonCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const PopulationTab: React.FC = () => {
  return (
    <TabContainer id="population-content">
      <ComingSoonCard padding="xl" elevated>
        <Column gap="lg" align="center">
          <span style={{ fontSize: '4em' }}>👥</span>
          <Heading2>Population Management</Heading2>
          <Text size="lg" color={theme.colors.textLight}>
            Coming soon...
          </Text>
          <Text size="sm" color={theme.colors.textMuted}>
            Manage your squirrel colony's growth, housing, and social dynamics.
          </Text>
        </Column>
      </ComingSoonCard>
    </TabContainer>
  );
};

export default PopulationTab;

