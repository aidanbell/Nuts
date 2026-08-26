import styled, { css } from 'styled-components';
import { theme } from './theme';

// ==================== LAYOUT COMPONENTS ====================

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.md};
`;

export const Row = styled.div<{ gap?: keyof typeof theme.spacing; align?: string; justify?: string }>`
  display: flex;
  flex-direction: row;
  gap: ${({ gap }) => gap ? theme.spacing[gap] : theme.spacing.md};
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
`;

export const Column = styled.div<{ gap?: keyof typeof theme.spacing; align?: string; justify?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap ? theme.spacing[gap] : theme.spacing.md};
  align-items: ${({ align }) => align || 'stretch'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
`;

export const Grid = styled.div<{ columns?: number; gap?: keyof typeof theme.spacing }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 2}, 1fr);
  gap: ${({ gap }) => gap ? theme.spacing[gap] : theme.spacing.md};
`;

export const Spacer = styled.div<{ size?: keyof typeof theme.spacing }>`
  height: ${({ size }) => size ? theme.spacing[size] : theme.spacing.md};
  width: ${({ size }) => size ? theme.spacing[size] : theme.spacing.md};
`;

// ==================== CARD COMPONENTS ====================

export const TabContainer = styled.div`
  padding: ${theme.spacing.lg};
  min-height: 70vh;
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
  }
`;

export const Card = styled.div<{ padding?: keyof typeof theme.spacing; elevated?: boolean }>`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${({ padding }) => padding ? theme.spacing[padding] : theme.spacing.md};
  box-shadow: ${({ elevated }) => elevated ? theme.shadows.md : theme.shadows.sm};
  transition: box-shadow ${theme.transitions.normal};
  
  &:hover {
    box-shadow: ${({ elevated }) => elevated ? theme.shadows.lg : theme.shadows.md};
  }
`;

export const Panel = styled.div<{ variant?: 'default' | 'info' | 'warning' | 'success' }>`
  background: ${({ variant }) => {
    switch (variant) {
      case 'info': return '#e3f2fd';
      case 'warning': return '#fff3e0';
      case 'success': return '#e8f5e9';
      default: return theme.colors.surface;
    }
  }};
  border: 2px solid ${({ variant }) => {
    switch (variant) {
      case 'info': return theme.colors.info;
      case 'warning': return theme.colors.warning;
      case 'success': return theme.colors.success;
      default: return theme.colors.border;
    }
  }};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`;

// ==================== BUTTON COMPONENTS ====================

const buttonBase = css`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
  
  &:not(:disabled):active {
    transform: translateY(0);
  }
`;

export const Button = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}>`
  ${buttonBase}
  
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  padding: ${({ size }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'lg': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.md;
    }
  }};
  
  background: ${({ variant }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  }};
  
  color: white;
  box-shadow: ${theme.shadows.sm};
  
  &:not(:disabled):hover {
    box-shadow: ${theme.shadows.md};
    filter: brightness(1.1);
  }
`;

export const IconButton = styled.button`
  ${buttonBase}
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.round};
  background: transparent;
  color: ${theme.colors.text};
  
  &:not(:disabled):hover {
    background: ${theme.colors.hover};
  }
`;

export const OutlineButton = styled(Button)`
  background: transparent;
  border: 2px solid ${({ variant }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  }};
  
  color: ${({ variant }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  }};
  
  &:not(:disabled):hover {
    background: ${({ variant }) => {
      switch (variant) {
        case 'primary': return theme.colors.primary;
        case 'secondary': return theme.colors.secondary;
        case 'success': return theme.colors.success;
        case 'warning': return theme.colors.warning;
        case 'danger': return theme.colors.danger;
        default: return theme.colors.primary;
      }
    }};
    color: white;
  }
`;

// ==================== SWITCH COMPONENTS ====================

export const SwitchThumb = styled.span`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transition: transform ${theme.transitions.fast};
`;

export const Switch = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 24px;
  height: 12px;
  border-radius: 12px;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  cursor: pointer;
  position: relative;
  transition: background ${theme.transitions.fast};
  
  &:checked {
    background: ${theme.colors.primary};
  }
  
  &:checked + ${SwitchThumb} {
    transform: translateX(12px);
  }
`;

export const SwitchLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
  border-radius: 50%;
  background: ${theme.colors.primary};
  transition: transform ${theme.transitions.fast};
  
  &:checked {
    background: ${theme.colors.primary};
  }
`;

// ==================== TEXT COMPONENTS ====================

export const Heading1 = styled.h1`
  font-size: ${theme.typography.fontSize.xxxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.2;
`;

export const Heading2 = styled.h2`
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.3;
`;

export const Heading3 = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1.4;
`;

export const Text = styled.p<{ size?: keyof typeof theme.typography.fontSize; color?: string; weight?: keyof typeof theme.typography.fontWeight }>`
  font-size: ${({ size }) => size ? theme.typography.fontSize[size] : theme.typography.fontSize.md};
  color: ${({ color }) => color || theme.colors.text};
  font-weight: ${({ weight }) => weight ? theme.typography.fontWeight[weight] : theme.typography.fontWeight.normal};
  margin: 0;
  line-height: 1.5;
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xs};
  display: block;
`;

// ==================== BADGE & TAG COMPONENTS ====================

export const Badge = styled.span<{ variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  
  background: ${({ variant }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  }};
  
  color: white;
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
`;

// ==================== PROGRESS COMPONENTS ====================

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  position: relative;
`;

export const ProgressBarFill = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  width: ${({ percentage }) => Math.min(100, Math.max(0, percentage))}%;
  background: ${({ color }) => color || theme.colors.primary};
  transition: width ${theme.transitions.normal};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// ==================== GAME-SPECIFIC COMPONENTS ====================

export const ResourceDisplay = styled(Row)`
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
`;

export const ResourceIcon = styled.span<{ size?: 'sm' | 'md' | 'lg' }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return '1.5em';
      case 'lg': return '3em';
      default: return '2em';
    }
  }};
  line-height: 1;
`;

export const TabButton = styled.button<{ active?: boolean }>`
  ${buttonBase}
  background: ${({ active }) => active ? theme.colors.active : 'transparent'};
  color: ${({ active }) => active ? theme.colors.primary : theme.colors.text};
  border-bottom: 3px solid ${({ active }) => active ? theme.colors.primary : 'transparent'};
  border-radius: 0;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  
  &:hover {
    background: ${({ active }) => active ? theme.colors.active : theme.colors.hover};
  }
`;

export const GameCard = styled(Card)`
  cursor: pointer;
  user-select: none;
  
  &:active {
    transform: scale(0.98);
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  pointer-events: none;
  z-index: 1000;
  box-shadow: ${theme.shadows.lg};
  max-width: 250px;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: ${theme.spacing.md} 0;
`;
