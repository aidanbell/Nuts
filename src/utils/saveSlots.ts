/**
 * Dev-only save slots (DebugPanel), separate from the main autosave.
 * Stored in localStorage — a slot is a frozen SaveData snapshot you can
 * jump back to, e.g. "start of Wood Age", so playtests don't need a
 * full replay from scratch every time.
 */

import type { SaveData } from "../types/game";
import { saveGame, loadGame } from "../engine/saveSystem";
import { loadSaveData } from "../engine/state";

const SLOT_INDEX_KEY = "nuts_save_slots";
const SLOT_DATA_PREFIX = "nuts_save_slot_";

export interface SaveSlotMeta {
  id: string;
  name: string;
  savedAt: number;
  era: string;
  season: number;
  nuts: number;
}

function readIndex(): SaveSlotMeta[] {
  try {
    const raw = localStorage.getItem(SLOT_INDEX_KEY);
    return raw ? (JSON.parse(raw) as SaveSlotMeta[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(slots: SaveSlotMeta[]): void {
  localStorage.setItem(SLOT_INDEX_KEY, JSON.stringify(slots));
}

/** Newest first. */
export function listSaveSlots(): SaveSlotMeta[] {
  return readIndex().sort((a, b) => b.savedAt - a.savedAt);
}

/** Snapshot the live game into a new named slot. */
export function saveToSlot(name: string): SaveSlotMeta | null {
  // Route through the real save/load pair so the slot holds exactly what
  // the main save system would persist, not a hand-rolled duplicate shape.
  saveGame();
  const data = loadGame();
  if (!data) return null;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const meta: SaveSlotMeta = {
    id,
    name: name.trim() || new Date().toLocaleString(),
    savedAt: Date.now(),
    era: data.story?.currentEra ?? "PREHISTORY",
    season: data.meta?.seasonIndex ?? 0,
    nuts: Math.round(data.nutsTotal),
  };

  localStorage.setItem(SLOT_DATA_PREFIX + id, JSON.stringify(data));
  writeIndex([...readIndex(), meta]);
  return meta;
}

/** Load a slot's snapshot into the live game and persist it as the active save. */
export function loadFromSlot(id: string): boolean {
  const raw = localStorage.getItem(SLOT_DATA_PREFIX + id);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as SaveData;
    loadSaveData(data);
    saveGame();
    return true;
  } catch (error) {
    console.error("Failed to load save slot:", error);
    return false;
  }
}

export function deleteSlot(id: string): void {
  localStorage.removeItem(SLOT_DATA_PREFIX + id);
  writeIndex(readIndex().filter((s) => s.id !== id));
}
