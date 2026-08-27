/**
 * Main Entry Point
 *
 * Currently supports both React and SolidJS for smooth migration.
 * React is used by default, but SolidJS can be enabled by using SolidApp.
 *
 * TODO: AGENT - Once all components are migrated to SolidJS,
 * remove React dependencies and switch to SolidJS-only rendering.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// For SolidJS, we would use:
// import { render } from 'solid-js/web';
// import SolidApp from './SolidApp';
// render(() => <SolidApp />, document.getElementById('root')!);

// For now, keep React rendering during migration
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
