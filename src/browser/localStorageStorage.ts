import type { SaveStorage } from "../engine/platform";

const SAVE_KEY = "nuts_game_save";

export const localStorageStorage: SaveStorage = {
  read() {
    return localStorage.getItem(SAVE_KEY);
  },
  write(data: string) {
    localStorage.setItem(SAVE_KEY, data);
  },
  clear() {
    localStorage.removeItem(SAVE_KEY);
  },
};
