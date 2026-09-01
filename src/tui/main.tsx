import { createCliRenderer } from "@opentui/core";
import { render } from "@opentui/solid";
import { attachStore } from "../engine/runtime";
import { createEngine } from "../engine/createEngine";
import { createSolidStore } from "../browser/solidStore";
import { terminalClock } from "../terminal/clock";
import { fileStorage } from "../terminal/fileStorage";
import App from "./App";

attachStore(createSolidStore());

const renderer = await createCliRenderer({ exitOnCtrlC: false });

let unregisterUnload: (() => void) | undefined;

const teardown = createEngine({
  clock: terminalClock,
  storage: fileStorage,
  registerUnload: (save) => {
    const shutdown = () => {
      save();
      unregisterUnload?.();
      teardown();
      renderer.destroy();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    unregisterUnload = () => {
      process.off("SIGINT", shutdown);
      process.off("SIGTERM", shutdown);
    };
    return unregisterUnload;
  },
});

await render(() => <App />, renderer);
