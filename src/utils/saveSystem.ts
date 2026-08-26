import type { SaveData } from '../types/game';

const SAVE_COOKIE_NAME = 'nuts_game_save';

// Simple obfuscation - not cryptographically secure, just to prevent casual tampering
const obfuscate = (data: string): string => {
  return btoa(data).split('').reverse().join('');
};

const deobfuscate = (data: string): string => {
  return atob(data.split('').reverse().join(''));
};

export const saveGame = (gameState: Partial<SaveData>): void => {
  try {
    const saveData: SaveData = {
      nutsTotal: gameState.nutsTotal || 0,
      nutsAllTime: gameState.nutsAllTime || 0,
      goldNuts: gameState.goldNuts || { total: 0, multi: 0.12 },
      squirrels: gameState.squirrels || {},
      nextSquirrelId: gameState.nextSquirrelId || 1,
      population: gameState.population || { jobless: [] },
      jobSites: gameState.jobSites || { jobless: { time: 3000, multi: 1, value: 1, level: 0, chance: 0.3, cost: 0, method: "ground" }, production: {}, refinement: {} },
      getButton: gameState.getButton || { value: 1, mult: 1 },
      timestamp: Date.now(),
    };
    
    const saveString = JSON.stringify(saveData);
    const obfuscatedData = obfuscate(saveString);
    
    // Set cookie with 1 year expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    document.cookie = `${SAVE_COOKIE_NAME}=${obfuscatedData}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
    
    console.log('Game saved successfully');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = (): SaveData | null => {
  try {
    const cookies = document.cookie.split(';');
    const saveCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${SAVE_COOKIE_NAME}=`)
    );
    
    if (!saveCookie) {
      return null;
    }
    
    const obfuscatedData = saveCookie.split('=')[1];
    const saveString = deobfuscate(obfuscatedData);
    const saveData: SaveData = JSON.parse(saveString);
    
    // Validate save data structure
    if (!saveData || typeof saveData.nutsTotal !== 'number') {
      console.warn('Invalid save data structure');
      return null;
    }
    
    console.log('Game loaded successfully');
    return saveData;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearSave = (): void => {
  document.cookie = `${SAVE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log('Save data cleared');
};

export const exportSave = (): string => {
  const saveData = loadGame();
  if (!saveData) {
    throw new Error('No save data to export');
  }
  
  return btoa(JSON.stringify(saveData));
};

export const importSave = (saveString: string): SaveData | null => {
  try {
    const saveData: SaveData = JSON.parse(atob(saveString));
    
    // Validate save data structure
    if (!saveData || typeof saveData.nutsTotal !== 'number') {
      throw new Error('Invalid save data structure');
    }
    
    // Save the imported data
    saveGame(saveData);
    
    return saveData;
  } catch (error) {
    console.error('Failed to import save:', error);
    return null;
  }
};

