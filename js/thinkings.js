/* ----------- CACHED ELEMENTS ----------- */
const thinkingsContainer = document.getElementById("thinkings-container");

let THINKING_THRESHOLD = 0;

class Thinking {
  static id = 0;
  constructor(name, cost, type, effect) {
    this._id = `${type[0]}-${Thinking.id++}`
    this.name = name;
    this.cost = cost;
    this.type = type;
    this.effect = effect;
    this.owned = 0;
    this.hidden = true;
    this.locked = true;
  }

}


class BigThinking extends Thinking {
  constructor(name, cost, type, effect) {
    super(name, cost, type);
    this.effect = effect;
  }

}
const bigThinkings = []

class MetaThinking extends Thinking {
  constructor(name, cost, type, effect) {
    super(name, cost, type);
    this.effect = effect;
  }

}

class GetThinking extends Thinking {
  constructor(name, cost, type, effect, value) {
    super(name, cost, type);
    this.effect = effect;
    this.value = value;
    this.owned = 0;
  }

}

const getThinkings = [

]

const thinkings = [
  new Thinking(
    "Think...",
    2,
    "unlocker",
    "Dedicate a squirrel to thinking."
  ),
  new Thinking(
    "Focus",
    5,
    "unlocker",
    "Increases thoughts per minute. Unlocks the notion of professions."
  ),
  new Thinking(
    "Ponder",
    10,
    "unlocker",
    "Increases thoughts per minute. Unlocks the division of thoughts."
  ),

  new GetThinking(
    "Gathering...",
    17,
    "unlocker",
    "Unlocks the ability to Gather",
    1
  ),
  new GetThinking(
    "Scavenging...",
    100,
    "unlocker",
    "Unlocks the ability to Scavenge",
    1
  ),
];

function checkThinkings() {
  thinkings.forEach((thinking) => {
    if (!thinking.hidden) {
      costChecker(thinking.cost, thinking._id, 'thoughts')
    }
  });
  switch (THINKING_THRESHOLD) {
    case 1:
      thinkingUnlocker(thinkings[0])
      THINKING_THRESHOLD++;
      break
    case 2:
      if (thinkings[0].owned) {
        thinkingUnlocker(thinkings[1])
        THINKING_THRESHOLD++;
        break;
      }
    case 3:
      if (thinkings[1].owned && thoughtsTotal > 5) {
        thinkingUnlocker(thinkings[2])
        THINKING_THRESHOLD++;
        break;
      }
  }
}

function thinkingUnlocker(thinking) {
  if (thinking.constructor.name === "Thinking") {
    thinking.hidden = false;
    thinkingsContainer.append(buildThinking(thinking));
  }
  if (thinking.constructor.name === "BigThinking") {
  }
  if (thinking.constructor.name === "MetaThinking") {
  }
  if (thinking.constructor.name === "GetThinking") {
  }
}
// One General Think Checker:
  // Unhide Checker:
    // Each thinking will have requisites beyond cost
    // function will check if requisites are met
    // Unhide DOM elements




function handleBuyThinking(thinking) {
  if (thoughtsTotal < thinking.cost) return;
  if (thinking.constructor.name === "Thinking") {
    if (thinking.type === "unlocker") {
      thinking.hidden = true;
      thinking.owned++;
      thoughtsTotal -= thinking.cost;
      document.getElementById(thinking._id).remove();
      buyResolver(thinking)
    }
  }
  if (thinking.constructor.name === "BigThinking") {
  }
  if (thinking.constructor.name === "MetaThinking") {
  }
  if (thinking.constructor.name === "GetThinking") {
  }
}


function buyResolver(thinking) {
  if (thinking._id === "u-0") {
    document.querySelector(".thinkers-container").classList.remove("hidden");
    return;
  }
  if (thinking._id === "u-1") {
    document.querySelector(".profession-container").classList.remove("hidden");
    return;
  }
}