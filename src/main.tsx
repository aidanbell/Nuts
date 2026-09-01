import { render } from "solid-js/web";
import { attachStore } from "./engine/runtime";
import { createSolidStore } from "./browser/solidStore";
import App from "./App";
import "./index.css";

attachStore(createSolidStore());

render(() => <App />, document.getElementById("root")!);
