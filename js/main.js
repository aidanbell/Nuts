// JS for page tabs

const nav = document.querySelector('nav')

let foo = (evt) => {
  document.querySelector('.tab-content.active').classList.replace('active', 'hidden');
  document.querySelector(`#${evt.target.id}-content`).classList.replace('hidden', 'active');
  document.querySelector('.tabs.active').classList.remove('active');
  evt.target.classList.add('active');
}

nav.addEventListener('click', foo)

// should add in scripts that run on load
//      -price checker to disable things you can't afford
//      -things to hide/reveal tabs until checkpoints

/*----- constants -----*/

// When you instantiate a class, push it to the appropriate
// array: timerFunctions

// Game Logic:
// Multi: Gets multiplied to the value
// Value: Baseline what is added to the Nuts Total per time

class Button {
  constructor(field, effects, cost, time = 1000) {
    this.field = field;
    this.effects = effects;
    this.cost = cost;
    this.time = time;
    this.value = 1;
    this.multi = 1.1;
    this.owned = 0;
  }
};

class WorkerButton {
  constructor(time, cost, value) {
    this.time = time;
    this.cost = cost;
    this.value = value;
    this.multi = 1;
    this.owned = 0;
    this.running = false;
  }

  work = () => {
    nutsTotal += (this.value * this.multi * this.owned / this.time);
  }
}

/*----- app's state (variables) -----*/
let nutsTotal = 100;

// For mainGameLoop

let timerFunctions = [];
let secretFunctions = [];

let getButton = {
  value: 1,
  mult: 1
}


// const loopFunctions = ()

timerFunctions.forEach(button => button.doThing());


/*----- cached element references -----*/
let TOTAL = document.querySelector('#total');

const homeTab = document.querySelector('#home-content');
const scienceTab = document.querySelector('#science-content');

const create = (thing) => {
  if (thing === "worker") {
    document.createElement(button)
  }
}

/*----- functions -----*/
const priceCheck = (worker) => {
  if (worker.cost === 'undefined') {
    return false
  }
  if (nutsTotal >= worker.cost) {
    return true
  }
  return false;
}

const check = (worker, nuts) => {
  if (nutsTotal >= nuts && document.querySelector(`.${worker}-div`).classList.contains('hidden')) {
    return true;
  } else {
    return false;
  }
}

const show = () => {
  console.log("show");
  if (check('w1', 20) === true) {
    document.querySelector('.w1-div').classList.remove("hidden");
    w1Button = new WorkerButton(1000, 50, 1);
    timerFunctions.push(w1Button);
    return;
  }
  if (priceCheck(w1Button)) {
    document.querySelector('#buy-w1').disabled = false;
  }
  if (nutsTotal < 400) return;
  if (check('w2', 400) === true) {
    document.querySelector('.w2-div').classList.remove('hidden');
    w2Button = new WorkerButton(1000, 250, 10);
    timerFunctions.push(w2Button);
    return;
  }
  if (priceCheck(w2Button)) {
    document.querySelector('#buy-w2').disabled = false;
  }
  if (nutsTotal < 900) return;
  if (check('w3', 1000) === true) {
    document.querySelector('.w3-div').classList.remove("hidden");
    w3Button = new WorkerButton(1000, 1000, 100)
    return;
  }
  if (priceCheck(w3Button)) {
    document.querySelector('#buy-w3').disabled = false;
  }
  if (nutsTotal < 2000) return;
  if (check('w4', 2000) === true) {
    document.querySelector('.w4-div').classList.remove('hidden');
    return;
  }
  if (priceCheck(w4Button)) {
    document.querySelector('#buy-w4').disabled = false;
  }

  switch (nutsTotal) {
    case 50:
      let upGetButton = new Button('science', 'getVal', 50);
      break;
  }
};


const render = () => {
  TOTAL.textContent = Math.floor(nutsTotal);
  document.querySelector('#debug-total').textContent = Math.round(nutsTotal * 1000) / 1000;
}


const homeHandle = (evt) => {
  if (evt.target.id === 'get-nuts') {
    getNuts()
  };
  if (evt.target.id === 'buy-w1') {
    if (nutsTotal >= w1Button.cost) {
      nutsTotal -= w1Button.cost;
      w1Button.cost = Math.floor(w1Button.cost * 1.23);
      w1Button.owned += 1;
      if (w1Button.owned % 20 === 0) {
        w1Button.value += 1
      }
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${w1Button.cost}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${w1Button.owned}`
      document.querySelector('#w1-indicator').textContent = `${Math.round(((w1Button.value * w1Button.multi * w1Button.owned / w1Button.time) * 100) * 10) /10}/sec`
    }
  }
  if (evt.target.id === 'buy-w2') {
    if (nutsTotal >= w2Button.cost) {
      nutsTotal -= w2Button.cost;
      w2Button.cost = Math.floor(w2Button.cost * 1.23)
      w2Button.owned += 1;
      if (w2Button.owned % 20 === 0) {
        w2Button.value += 1
      }
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${w2Button.cost}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${w2Button.owned}`
      document.querySelector('#w2-indicator').textContent = `${Math.round(((w2Button.value * w2Button.multi * w2Button.owned / w2Button.time) * 100) * 10) /10}/sec`
    }
  }
};

const scienceHandle = (evt) => {
  if (evt.target.id === 'get-val') {
    if (typeof upGetButton === "undefined") {
      upGetButton = new Button('science', 'getVal', 100);
    }
    if (nutsTotal <= upGetButton.cost) return;
    nutsTotal -= upGetButton.cost;
    getButton.value += (upGetButton.value * upGetButton.multi);
    upGetButton.owned += 1;
    render();
    upGetButton.cost = Math.floor(upGetButton.cost * 1.75);
    document.querySelector(`#${evt.target.id} > .cost`).textContent = `${upGetButton.cost}`;
    document.querySelector(`#${evt.target.id} > .current`).textContent = `${upGetButton.value * upGetButton.owned + 1}`;
  }
}

const getNuts = () => {
  nutsTotal += (getButton.value * getButton.mult);
  render();
};

window.setInterval(function() {
  timerFunctions.forEach(button => button.work());
  show();
  render();
}, 10)

/*----- event listeners -----*/
homeTab.addEventListener('click', homeHandle);
scienceTab.addEventListener('click', scienceHandle);