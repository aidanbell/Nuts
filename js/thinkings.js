let CHECK_THRESHOLD = 0;

class Thinking {
  constructor(name, cost, type, effect) {
    this.name = name;
    this.cost = cost;
    this.type = type;
    this.effect = effect;
    this.owned = 0;
    this.hidden = true;
  }

}
const thinkings = [
  new Thinking("Think", 2, "think", "Increases thoughts per minute"),
  new Thinking("Focus", 5, "think", "Increases thoughts per minute. Unlocks the notion of professions."),
  new Thinking("Ponder", 10, "think", "Increases thoughts per minute. Unlocks the division of thoughts.")
]

class BigThinking extends Thinking {
  constructor(name, cost, type, effect) {
    super(name, cost, type);
    this.effect = effect;
    this.unlocked = false;
  }

}
const bigThinkings = []

class MetaThinking extends Thinking {
  constructor(name, cost, type, effect) {
    super(name, cost, type);
    this.effect = effect;
    this.unlocked = false;
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
  new GetThinking("Gathering...", 17, "getThink", "Unlocks the ability to Gather", 1),
  new GetThinking("Scavenging...", 100, "getThink", "Unlocks the ability to Scavenge", 1),
]


function checkThinkings() {
  switch (CHECK_THRESHOLD) {
    case 0:
      thinkings[0].hidden = false;
      buildThinking(thinkings[0])
    case 1:
      thinkings[1].hidden = false;
      buildThinking(thinkings[1])
    case 2:
      thinkings[2].hidden = false;
      buildThinking(thinkings[2])
  }
  CHECK_THRESHOLD++;

}

