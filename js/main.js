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
  constructor(time, cost) {
    this.time = time;
    this.cost = cost;
    this.value = 1;
    this.multi = 1;
    this.owned = 0;
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
const show = () => {
  console.log("show");
  if (nutsTotal <= 50) {
    document.querySelector('.farm-div').style.display = "flex";
  } else if (nutsTotal >= 100) {
    document.querySelector('#buy-farm').disabled = false;
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
  if (evt.target.id === 'buy-farm') {
    if (typeof farmButton === 'undefined') {
      farmButton = new WorkerButton(1000, 100);
      timerFunctions.push(farmButton);
    }
    if (nutsTotal >= farmButton.cost) {
      nutsTotal -= farmButton.cost;
      farmButton.cost = Math.floor(farmButton.cost * 1.13);
      farmButton.owned += 1;
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${farmButton.cost}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${farmButton.owned}`
      document.querySelector('#farm-indicator').textContent = `${Math.round(((farmButton.value * farmButton.multi * farmButton.owned / farmButton.time) * 100) * 10) /10}/sec`
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