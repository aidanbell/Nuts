/**
 * Save/load via cookie storage, backed by the Solid store.
 */

import { appState, loadSaveData } from "./state";
import type { SaveData } from "../types/game";

const SAVE_COOKIE_NAME = "nuts_game_save";

const obfuscate = (data: string): string => {
  return btoa(data).split("").reverse().join("");
};

const deobfuscate = (data: string): string => {
  return atob(data.split("").reverse().join(""));
};

export const saveGame = (): void => {
  try {
    const game = appState.game;
    const meta = appState.meta;
    const story = appState.story;
    const ideas = appState.ideas;

    const saveData: SaveData = {
      nutsTotal: game.nutsTotal,
      nutsAllTime: game.nutsAllTime,
      goldNuts: game.goldNuts,
      squirrels: game.squirrels,
      nextSquirrelId: game.nextSquirrelId,
      population: game.population,
      jobSites: game.jobSites,
      getButton: game.getButton,
      resources: game.resources,
      unlockedTabs: game.unlockedTabs,
      activeTab: game.activeTab,
      timer: game.timer,
      meta: { ...meta },
      story: {
        completedCheckpoints: [...story.completedCheckpoints],
        currentEra: story.currentEra,
      },
      ideas: {
        researchedIdeas: [...ideas.researchedIdeas],
      },
      timestamp: Date.now(),
    };

    const saveString = JSON.stringify(saveData);
    const obfuscatedData = obfuscate(saveString);

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    document.cookie = `${SAVE_COOKIE_NAME}=${obfuscatedData}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;

    console.log("Game saved successfully");
  } catch (error) {
    console.error("Failed to save game:", error);
  }
};

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

export const clearSave = (): void => {
  document.cookie = `${SAVE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log("Save data cleared");
};

export const exportSave = (): string => {
  const saveData = loadGame();
  if (!saveData) {
    throw new Error("No save data to export");
  }

  return btoa(JSON.stringify(saveData));
};

export const importSave = (saveString: string): SaveData | null => {
  try {
    const saveData: SaveData = JSON.parse(atob(saveString));

    if (!saveData || typeof saveData.nutsTotal !== "number") {
      throw new Error("Invalid save data structure");
    }

    loadSaveData(saveData);
    saveGame();

    return saveData;
  } catch (error) {
    console.error("Failed to import save:", error);
    return null;
  }
};
