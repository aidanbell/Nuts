/**
 * Framework-agnostic store: path set + Solid-compatible object merge.
 * Browser uses createSolidStore (createStore passthrough). TUI/tests use this.
 */

import { initialAppState, type AppState } from "./initialState";

type StoreSetter<T> = T | Partial<T> | ((prev: T) => T);

/**
 * Path-based setter matching Solid's createStore call shapes
 * (objects merge, arrays replace).
 */
export interface SetStoreFunction<T> {
  (setter: StoreSetter<T>): void;
  <K1 extends keyof T>(k1: K1, setter: StoreSetter<T[K1]>): void;
  <K1 extends keyof T, K2 extends keyof NonNullable<T[K1]>>(
    k1: K1,
    k2: K2,
    setter: StoreSetter<NonNullable<T[K1]>[K2]>,
  ): void;
  <
    K1 extends keyof T,
    K2 extends keyof NonNullable<T[K1]>,
    K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    setter: StoreSetter<NonNullable<NonNullable<T[K1]>[K2]>[K3]>,
  ): void;
  <
    K1 extends keyof T,
    K2 extends keyof NonNullable<T[K1]>,
    K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
    K4 extends keyof NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>,
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    setter: StoreSetter<
      NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]
    >,
  ): void;
  <
    K1 extends keyof T,
    K2 extends keyof NonNullable<T[K1]>,
    K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
    K4 extends keyof NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>,
    K5 extends keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]
    >,
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5,
    setter: StoreSetter<
      NonNullable<NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]>[K5]
    >,
  ): void;
  <
    K1 extends keyof T,
    K2 extends keyof NonNullable<T[K1]>,
    K3 extends keyof NonNullable<NonNullable<T[K1]>[K2]>,
    K4 extends keyof NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>,
    K5 extends keyof NonNullable<
      NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]
    >,
    K6 extends keyof NonNullable<
      NonNullable<NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]>[K5]
    >,
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5,
    k6: K6,
    setter: StoreSetter<
      NonNullable<
        NonNullable<
          NonNullable<NonNullable<NonNullable<T[K1]>[K2]>[K3]>[K4]
        >[K5]
      >[K6]
    >,
  ): void;
}

export interface Store {
  readonly state: AppState;
  set: SetStoreFunction<AppState>;
  transaction?(fn: () => void): void;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unwrap(current: unknown, setter: unknown): unknown {
  if (typeof setter === "function") {
    return (setter as (prev: unknown) => unknown)(current);
  }
  return setter;
}

/** Objects merge recursively; arrays and primitives replace (Solid store semantics). */
function mergeStoreNode(
  current: Record<string, unknown>,
  next: Record<string, unknown>,
): void {
  for (const key of Object.keys(next)) {
    const nextVal = next[key];
    const prevVal = current[key];
    if (nextVal === prevVal) continue;
    if (isPlainObject(nextVal) && isPlainObject(prevVal)) {
      mergeStoreNode(prevVal, nextVal);
    } else {
      current[key] = nextVal;
    }
  }
}

function applySet(root: AppState, args: unknown[]): void {
  if (args.length === 0) return;

  const setter = args[args.length - 1];
  const path = args.slice(0, -1) as PropertyKey[];

  if (path.length === 0) {
    const next = unwrap(root, setter);
    if (isPlainObject(next)) {
      mergeStoreNode(
        root as unknown as Record<string, unknown>,
        next as Record<string, unknown>,
      );
    }
    return;
  }

  let parent: Record<PropertyKey, unknown> = root as unknown as Record<
    PropertyKey,
    unknown
  >;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    let child = parent[key];
    if (!isPlainObject(child) && !Array.isArray(child)) {
      child = {};
      parent[key] = child;
    }
    parent = child as Record<PropertyKey, unknown>;
  }

  const lastKey = path[path.length - 1]!;
  const current = parent[lastKey];
  const next = unwrap(current, setter);

  if (isPlainObject(next) && isPlainObject(current)) {
    mergeStoreNode(current, next);
  } else {
    parent[lastKey] = next;
  }
}

export function createMemoryStore(initial: AppState = initialAppState): Store {
  const state = structuredClone(initial);

  const set = ((...args: unknown[]) => {
    applySet(state, args);
  }) as SetStoreFunction<AppState>;

  return {
    state,
    set,
    transaction: (fn) => fn(),
  };
}
