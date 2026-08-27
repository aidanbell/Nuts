/**
 * SolidJS Save/Load System
 * Replaces the React saveSystem with SolidJS-compatible versions
 *
 * Uses the same cookie-based storage but works with the SolidJS store
 */

import { appState, loadSaveData } from "./state";
import type { SaveData } from "../types/game";

const SAVE_COOKIE_NAME = "nuts_game_save";

// Simple obfuscation - not cryptographically secure, just to prevent casual tampering
const obfuscate = (data: string): string => {
  return btoa(data).split("").reverse().join("");
};

const deobfuscate = (data: string): string => {
  return atob(data.split("").reverse().join(""));
};

/**
 * Save the current game state to a cookie
 * Uses the SolidJS store directly
 */
export const saveGame = (): void => {
  try {
    const game = appState.game;

    const saveData: SaveData = {
      nutsTotal: game.nutsTotal,
      nutsAllTime: game.nutsAllTime,
      goldNuts: game.goldNuts,
      squirrels: game.squirrels,
      nextSquirrelId: game.nextSquirrelId,
      population: game.population,
      jobSites: game.jobSites,
      getButton: game.getButton,
      timestamp: Date.now(),
    };

    const saveString = JSON.stringify(saveData);
    const obfuscatedData = obfuscate(saveString);

    // Set cookie with 1 year expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    document.cookie = `${SAVE_COOKIE_NAME}=${obfuscatedData}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;

    console.log("Game saved successfully");
  } catch (error) {
    console.error("Failed to save game:", error);
  }
};

/**
 * Load game state from cookie and into the SolidJS store
 * Returns the loaded data or null if no save exists
 */
export const loadGame = (): SaveData | null => {
  try {
    const cookies = document.cookie.split(";");
    const saveCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${SAVE_COOKIE_NAME}=`),
    );

    if (!saveCookie) {
      return null;
    }

    const obfuscatedData = saveCookie.split("=")[1];
    const saveString = deobfuscate(obfuscatedData);
    const saveData: SaveData = JSON.parse(saveString);

    // Validate save data structure
    if (!saveData || typeof saveData.nutsTotal !== "number") {
      console.warn("Invalid save data structure");
      return null;
    }

    console.log("Game loaded successfully");
    return saveData;
  } catch (error) {
    console.error("Failed to load game:", error);
    return null;
  }
};

/**
 * Clear the saved game data
 */
export const clearSave = (): void => {
  document.cookie = `${SAVE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log("Save data cleared");
};

/**
 * Export current save as a string for sharing/backup
 */
export const exportSave = (): string => {
  const saveData = loadGame();
  if (!saveData) {
    throw new Error("No save data to export");
  }

  return btoa(JSON.stringify(saveData));
};

/**
 * Import save from a string
 */
export const importSave = (saveString: string): SaveData | null => {
  try {
    const saveData: SaveData = JSON.parse(atob(saveString));

    // Validate save data structure
    if (!saveData || typeof saveData.nutsTotal !== "number") {
      throw new Error("Invalid save data structure");
    }

    // Load the imported data into the store
    loadSaveData(saveData);

    // Also save to cookie for persistence
    saveGame();

    return saveData;
  } catch (error) {
    console.error("Failed to import save:", error);
    return null;
  }
};
