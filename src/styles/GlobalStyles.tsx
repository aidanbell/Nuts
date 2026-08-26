import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    height: 100%;
    width: 100%;
  }
  
  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.md};
    color: ${theme.colors.text};
    background: linear-gradient(135deg, ${theme.colors.background} 0%, #e8e8e8 100%);
    background-attachment: fixed;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  
  #root {
    min-height: 100%;
  }
  
  button {
    font-family: inherit;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 12px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.md};
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.textMuted};
  }
  
  /* Utility classes */
  .hidden {
    display: none !important;
  }
`;
