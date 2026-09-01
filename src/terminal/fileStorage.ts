import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { SaveStorage } from "../engine/platform";

const SAVE_PATH = join(homedir(), ".nuts", "save.json");

export const fileStorage: SaveStorage = {
  read() {
    try {
      return readFileSync(SAVE_PATH, "utf-8");
    } catch {
      return null;
    }
  },
  write(data: string) {
    mkdirSync(dirname(SAVE_PATH), { recursive: true });
    writeFileSync(SAVE_PATH, data, "utf-8");
  },
  clear() {
    if (existsSync(SAVE_PATH)) rmSync(SAVE_PATH);
  },
};
