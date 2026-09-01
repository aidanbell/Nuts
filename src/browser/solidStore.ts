import { batch } from "solid-js";
import { createStore } from "solid-js/store";
import { initialAppState } from "../engine/initialState";
import type { SetStoreFunction, Store } from "../engine/store";

export function createSolidStore(): Store {
  const [state, set] = createStore(structuredClone(initialAppState));
  return {
    state,
    set: set as SetStoreFunction<typeof initialAppState>,
    transaction: (fn) => batch(fn),
  };
}
