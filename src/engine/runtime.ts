/**
 * Bound store for this process. Call attachStore before any action or render.
 */

import type { AppState } from "./initialState";
import type { SetStoreFunction, Store } from "./store";

export type SetAppState = SetStoreFunction<AppState>;

export let appState!: AppState;
export let setAppState!: SetAppState;
export let runTransaction: (fn: () => void) => void = (fn) => fn();

export function attachStore(store: Store): void {
  appState = store.state;
  setAppState = store.set;
  runTransaction = store.transaction ?? ((fn) => fn());
}
