import React from 'react';
import styled from 'styled-components';
import { Column, Heading2, Text, Card } from '../../styles/components';
import { theme } from '../../styles/theme';

const TabContainer = styled.div`
  padding: ${theme.spacing.lg};
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
  }
`;

const ComingSoonCard = styled(Card)`
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const FourthTab: React.FC = () => {
  return (
    <TabContainer id="fourth-content">
      <ComingSoonCard padding="xl" elevated>
        <Column gap="lg" align="center">
          <span style={{ fontSize: '4em' }}>🔮</span>
          <Heading2>Mystery Feature</Heading2>
          <Text size="lg" color={theme.colors.textLight}>
            Coming soon...
          </Text>
          <Text size="sm" color={theme.colors.textMuted}>
            Something exciting is in development!
          </Text>
        </Column>
      </ComingSoonCard>
    </TabContainer>
  );
};

export default FourthTab;

