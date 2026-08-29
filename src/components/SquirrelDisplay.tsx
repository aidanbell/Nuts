import {
  type Component,
  Show,
  createSignal,
  createEffect,
  onCleanup,
} from "solid-js";
import { appState } from "../engine/state";

interface SquirrelDisplayProps {
  squirrelId: number;
  showNutFinding?: boolean;
}

const SquirrelDisplay: Component<SquirrelDisplayProps> = (props) => {
  const squirrel = () => appState.game.squirrels[props.squirrelId];

  const [showAnimation, setShowAnimation] = createSignal(false);
  const [animationPosition, setAnimationPosition] = createSignal("0%");
  const [isFlipped, setIsFlipped] = createSignal(false);

  let previousTotal = 0;

  createEffect(() => {
    const sq = squirrel();
    if (!sq || !props.showNutFinding) return;

    if (sq.total > previousTotal) {
      setAnimationPosition(`${Math.floor(Math.random() * 50)}%`);
      setShowAnimation(true);

      const timeout = setTimeout(() => {
        setShowAnimation(false);
        setAnimationPosition("0%");
      }, 600);

      previousTotal = sq.total;
      onCleanup(() => clearTimeout(timeout));
      return;
    }

    previousTotal = sq.total;
  });

  createEffect(() => {
    if (!props.showNutFinding) return;

    const flipInterval = setInterval(() => {
      setIsFlipped(Math.random() > 0.33);
    }, 1000);

    onCleanup(() => clearInterval(flipInterval));
  });

  return (
    <Show when={squirrel()}>
      {(sq) => (
        <div class="relative inline-block p-2 text-5xl" id={`s-${sq()._id}`}>
          <span
            class="inline-block transition-transform duration-300"
            style={{ transform: `scaleX(${isFlipped() ? -1 : 1})` }}
          >
            🐿️
          </span>
          <Show when={props.showNutFinding && showAnimation()}>
            <div
              id={`f-${sq()._id}`}
              class="animate-found-nut absolute text-xl"
              style={{ left: animationPosition(), top: "-2em" }}
            >
              🥜
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
};

export default SquirrelDisplay;
