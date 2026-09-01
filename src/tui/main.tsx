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

let shutdown = () => {};
let hasShutDown = false;

const teardown = createEngine({
  clock: terminalClock,
  storage: fileStorage,
  registerUnload: (save) => {
    shutdown = () => {
      // Raw mode intercepts Ctrl+C as a keystroke, not a SIGINT — this can
      // also be invoked directly from a useKeyboard handler, not just here.
      if (hasShutDown) return;
      hasShutDown = true;
      save();
      teardown();
      renderer.destroy();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    return () => {
      process.off("SIGINT", shutdown);
      process.off("SIGTERM", shutdown);
    };
  },
});

await render(() => <App onQuit={() => shutdown()} />, renderer);
