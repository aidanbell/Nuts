import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addNuts } from '../store/gameSlice';
import { addLog } from '../store/gameLogSlice';

export interface GoldenNutState {
  id: number;
  x: number; // percent of viewport width
  y: number; // percent of viewport height
  reward: number;
  spawnedAt: number;
  expiresAt: number;
  /** CSS lifetime for the current appearance (updated after pause) */
  durationMs: number;
}

const MIN_SPAWN_DELAY_MS = 20_000;
const MAX_SPAWN_DELAY_MS = 45_000;
const FIRST_SPAWN_MIN_MS = 8_000;
const FIRST_SPAWN_MAX_MS = 15_000;
const LIFETIME_MS = 13_000;
const FADE_MS = 2_000;
const MARGIN_PERCENT = 8; // keep away from edges

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const randomPosition = () => ({
  x: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
  y: randomBetween(MARGIN_PERCENT, 100 - MARGIN_PERCENT),
});

/** Expected nuts/sec for one jobless squirrel */
const joblessNutsPerSecond = (jobless: RootState['game']['jobSites']['jobless']) => {
  const attemptsPerSec = 1000 / jobless.time;
  return attemptsPerSec * jobless.chance * jobless.value * jobless.multi;
};

/** Burst reward: ~15s of all jobless production, scaled up slightly with count */
export const calculateGoldenNutReward = (
  joblessSite: RootState['game']['jobSites']['jobless'],
  joblessCount: number
): number => {
  const perSquirrel = joblessNutsPerSecond(joblessSite);
  const burst = perSquirrel * Math.max(1, joblessCount) * 15;
  // Slight bonus for keeping more jobless squirrels around
  const countBonus = 1 + Math.log2(1 + Math.max(0, joblessCount - 1)) * 0.15;
  return Math.max(5, Math.round(burst * countBonus));
};

export const useGoldenNut = () => {
  const dispatch = useDispatch();
  const isPaused = useSelector((state: RootState) => state.game.isPaused);
  const joblessIds = useSelector((state: RootState) => state.game.population.jobless);
  const joblessSite = useSelector((state: RootState) => state.game.jobSites.jobless);

  const [goldenNut, setGoldenNut] = useState<GoldenNutState | null>(null);
  const nextSpawnAtRef = useRef<number>(Date.now() + randomBetween(FIRST_SPAWN_MIN_MS, FIRST_SPAWN_MAX_MS));
  const idRef = useRef(0);
  const hasJobless = joblessIds.length > 0;

  const scheduleNextSpawn = useCallback((fromTime = Date.now()) => {
    nextSpawnAtRef.current =
      fromTime + randomBetween(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
  }, []);

  const spawnGoldenNut = useCallback(() => {
    if (joblessIds.length === 0) return;

    const now = Date.now();
    const { x, y } = randomPosition();
    const reward = calculateGoldenNutReward(joblessSite, joblessIds.length);

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
  }, [joblessIds.length, joblessSite]);

  const clearGoldenNut = useCallback(() => {
    setGoldenNut(null);
    scheduleNextSpawn();
  }, [scheduleNextSpawn]);

  const collectGoldenNut = useCallback(() => {
    if (!goldenNut) return;

    dispatch(addNuts(goldenNut.reward));
    dispatch(
      addLog({
        message: `Lucky find! Grabbed a glowing nut for ${goldenNut.reward} nuts.`,
        level: 'success',
      })
    );
    clearGoldenNut();
  }, [goldenNut, dispatch, clearGoldenNut]);

  // Despawn if player no longer has any jobless squirrels
  useEffect(() => {
    if (!hasJobless && goldenNut) {
      setGoldenNut(null);
      scheduleNextSpawn();
    }
  }, [hasJobless, goldenNut, scheduleNextSpawn]);

  // Spawn / expire loop
  useEffect(() => {
    const tick = () => {
      if (isPaused) return;

      const now = Date.now();

      if (goldenNut && now >= goldenNut.expiresAt) {
        setGoldenNut(null);
        scheduleNextSpawn(now);
        return;
      }

      if (!goldenNut && hasJobless && now >= nextSpawnAtRef.current) {
        spawnGoldenNut();
      }
    };

    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [isPaused, goldenNut, hasJobless, spawnGoldenNut, scheduleNextSpawn]);

  // While paused, push spawn/expiry timers forward so pause doesn't eat the wait
  const pauseStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
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
  }, [isPaused]);

  return {
    goldenNut,
    collectGoldenNut,
    fadeMs: FADE_MS,
  };
};
