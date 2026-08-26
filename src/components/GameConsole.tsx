import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Column, Text } from '../styles/components';

const ConsoleContainer = styled(Column)`
  background: rgba(0, 0, 0, 0.8);
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const LogEntry = styled.div<{ level: string }>`
  padding: 2px 0;
  color: ${props => {
    switch (props.level) {
      case 'success': return '#0f0';
      case 'warning': return '#ff0';
      case 'error': return '#f00';
      default: return '#ccc';
    }
  }};
  
  &::before {
    content: '${props => {
      switch (props.level) {
        case 'success': return '✓';
        case 'warning': return '⚠';
        case 'error': return '✗';
        default: return '›';
      }
    }}';
    margin-right: 8px;
    opacity: 0.7;
  }
`;

const GameConsole: React.FC = () => {
  const logs = useSelector((state: RootState) => state.gameLog.logs);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  return (
    <ConsoleContainer gap="xs">
      
      {logs.length === 0 ? (
        <Text size="sm" color="rgba(255, 255, 255, 0.5)">
          No logs yet...
        </Text>
      ) : (
        logs.map(log => (
          <LogEntry key={log.id} level={log.level}>
            {log.message}
          </LogEntry>
        ))
      )}
      
      <div ref={consoleEndRef} />
    </ConsoleContainer>
  );
};

export default GameConsole;

