/**
 * Browser-only glowing nut spawn/collect. Reward math lives in the engine.
 */

import { createEffect, createSignal, onCleanup, createMemo } from "solid-js";
import {
  appState,
  addNuts,
  addLog,
  calculateGoldenNutReward,
} from "../engine/state";

export interface GoldenNutState {
  id: number;
  x: number;
  y: number;
  reward: number;
  spawnedAt: number;
  expiresAt: number;
  durationMs: number;
}

const MIN_SPAWN_DELAY_MS = 20_000;
const MAX_SPAWN_DELAY_MS = 45_000;
const FIRST_SPAWN_MIN_MS = 8_000;
const FIRST_SPAWN_MAX_MS = 15_000;
const LIFETIME_MS = 13_000;
const FADE_MS = 2_000;
const MARGIN_PERCENT = 8;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const randomPosition = () => ({
  x: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
  y: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
});

export function createGoldenNut() {
  const [goldenNut, setGoldenNut] = createSignal<GoldenNutState | null>(null);
  const nextSpawnAtRef = {
    current: Date.now() + randomBetween(FIRST_SPAWN_MIN_MS, FIRST_SPAWN_MAX_MS),
  };
  const idRef = { current: 0 };
  const pauseStartedAtRef = { current: null as number | null };

  const hasJobless = createMemo(
    () => appState.game.population.jobless.length > 0,
  );

  const scheduleNextSpawn = (fromTime: number = Date.now()) => {
    nextSpawnAtRef.current =
      fromTime + randomBetween(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
  };

  const spawnGoldenNut = () => {
    const joblessIds = appState.game.population.jobless;
    if (joblessIds.length === 0) return;

    const now = Date.now();
    const { x, y } = randomPosition();
    const reward = calculateGoldenNutReward();

    idRef.current += 1;
    setGoldenNut({
      id: idRef.current,
      x,
      y,
      reward,
      spawnedAt: now,
      expiresAt: now + LIFETIME_MS,
      durationMs: LIFETIME_MS,
    });
  };

  const clearGoldenNut = () => {
    setGoldenNut(null);
    scheduleNextSpawn();
  };

  const collectGoldenNut = () => {
    const gn = goldenNut();
    if (!gn) return;

    addNuts(gn.reward);
    addLog(
      `Lucky find! Grabbed a glowing nut for ${gn.reward} nuts.`,
      "success",
    );
    clearGoldenNut();
  };

  createEffect(() => {
    if (!hasJobless() && goldenNut()) {
      setGoldenNut(null);
      scheduleNextSpawn();
    }
  });

  createEffect(() => {
    const isPaused = appState.game.isPaused;

    const tick = () => {
      if (appState.game.isPaused) return;

      const now = Date.now();
      const gn = goldenNut();

      if (gn && now >= gn.expiresAt) {
        setGoldenNut(null);
        scheduleNextSpawn(now);
        return;
      }

      if (
        !gn &&
        appState.game.population.jobless.length > 0 &&
        now >= nextSpawnAtRef.current
      ) {
        spawnGoldenNut();
      }
    };

    void isPaused;
    const interval = window.setInterval(tick, 250);
    onCleanup(() => window.clearInterval(interval));
  });

  createEffect(() => {
    const isPaused = appState.game.isPaused;

    if (isPaused) {
      pauseStartedAtRef.current = Date.now();
      return;
    }

    if (pauseStartedAtRef.current !== null) {
      const pausedFor = Date.now() - pauseStartedAtRef.current;
      nextSpawnAtRef.current += pausedFor;
      setGoldenNut((current) => {
        if (!current) return null;
        const newExpiresAt = current.expiresAt + pausedFor;
        return {
          ...current,
          expiresAt: newExpiresAt,
          durationMs: Math.max(FADE_MS, newExpiresAt - Date.now()),
        };
      });
      pauseStartedAtRef.current = null;
    }
  });

  return {
    goldenNut,
    collectGoldenNut,
    fadeMs: FADE_MS,
  };
}
