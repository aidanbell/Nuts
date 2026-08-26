import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { hibernate } from '../../store/gameSlice';
import { formatNumber } from '../../utils/formatters';
import styled from 'styled-components';
import { Column, Row, Button, Heading1, Heading3, Text, Panel } from '../../styles/components';
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

const HibernateCard = styled(Panel)`
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const HibernateButton = styled(Button)`
  font-size: ${theme.typography.fontSize.xl};
  padding: ${theme.spacing.lg} ${theme.spacing.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.typography.fontSize.lg};
    padding: ${theme.spacing.md} ${theme.spacing.xl};
  }
`;

const ConfirmPanel = styled(Panel)`
  margin-top: ${theme.spacing.xl};
  background: ${theme.colors.background};
  border-color: ${theme.colors.warning};
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GoldNutDisplay = styled(Heading1)`
  color: ${theme.colors.gold};
  font-size: ${theme.typography.fontSize.xxxl};
  margin: ${theme.spacing.lg} 0;
`;

const HibernateTab: React.FC = () => {
  const dispatch = useDispatch();
  const { nutsAllTime, goldNuts } = useSelector((state: RootState) => state.game);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const goldNutReward = useMemo(() => {
    return Math.floor(nutsAllTime / Math.pow(10, 6) * goldNuts.multi);
  }, [nutsAllTime, goldNuts.multi]);
  
  const handleHibernateClick = useCallback(() => {
    setShowConfirm(true);
  }, []);
  
  const handleConfirmHibernate = useCallback(() => {
    dispatch(hibernate());
    setShowConfirm(false);
  }, [dispatch]);
  
  return (
    <TabContainer id="hibernate-content">
      <HibernateCard variant="info">
        <Column gap="xl" align="center">
          <Heading1>💤 Hibernate</Heading1>
          
          <Column gap="md" align="center">
            <Text size="lg">
              Take a long winter's nap and return next season with bonus Gold Nuts!
            </Text>
            <Text size="md" color={theme.colors.textLight}>
              Current Reward: <strong style={{ color: theme.colors.gold }}>{formatNumber(goldNutReward)} ⭐ Gold Nuts</strong>
            </Text>
          </Column>
          
          <HibernateButton 
            variant="warning"
            size="lg"
            onClick={handleHibernateClick}
          >
            💤 HIBERNATE NOW
          </HibernateButton>
          
          {showConfirm && (
            <ConfirmPanel variant="warning">
              <Column gap="lg">
                <Heading3>⚠️ Are you sure?</Heading3>
                
                <Column gap="sm">
                  <Text size="lg">If you hibernate, you will receive:</Text>
                  <GoldNutDisplay id="gn-preview">
                    ⭐ {formatNumber(goldNutReward)} Gold Nuts
                  </GoldNutDisplay>
                </Column>
                
                <Text size="md" color={theme.colors.danger} weight="bold">
                  ⚠️ This will reset ALL your progress!
                </Text>
                
                <Row gap="md" justify="center">
                  <Button 
                    variant="danger"
                    size="lg"
                    onClick={handleConfirmHibernate}
                  >
                    ✓ Confirm Hibernate
                  </Button>
                  <Button 
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowConfirm(false)}
                  >
                    ✕ Cancel
                  </Button>
                </Row>
              </Column>
            </ConfirmPanel>
          )}
        </Column>
      </HibernateCard>
    </TabContainer>
  );
};

export default HibernateTab;

