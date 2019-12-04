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

class Button {
  constructor(field, effects, cost, time = 1000) {
    this.field = field;
    this.effects = effects;
    this.cost = cost;
    this.time = time;
    this.value = 1;
    this.multi = 1;
  }
};

class WorkerButton {
  constructor(time, cost) {
    this.time = time;
    this.cost = cost;
    this.value = 1;
    this.multi = 1;
    this.running = false;
  }

  work = () => {
    nutsTotal += (this.value * this.multi);
  }
}

/*----- app's state (variables) -----*/
let nutsTotal = 0;

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

/*----- functions -----*/
const show = () => {
  if (upGetButton) return;

  switch (nutsTotal) {
    case 50:
      let upGetButton = new Button('science', 'getVal', 50);
      break;
  }
};

const render = () => {
  TOTAL.textContent = nutsTotal;
}


const homeHandle = (evt) => {
  if (evt.target.id === 'get-nuts') {
    getNuts()
  };
  if (evt.target.id === 'farm') {
    if (typeof farmButton === 'undefined') {
      farmButton = new WorkerButton(1000, 100);
      farmButton.running = true;
    }
    timeout(farmButton);
  }
};

const scienceHandle = (evt) => {
  if (evt.target.id === 'get-val') {
    if (typeof upGetButton === "undefined") {
      upGetButton = new Button('science', 'getVal', 50);
      console.log(upGetButton);
      return;
    }
    if (nutsTotal < upGetButton.cost) return;
    getButton.value += upGetButton.value;
    nutsTotal -= upGetButton.cost;
    upGetButton.value *= 2
    TOTAL.textContent = nutsTotal;
    upGetButton.cost = Math.floor(upGetButton.cost * 1.1);
  }
}

const getNuts = () => {
  nutsTotal += (getButton.value * getButton.mult);
  TOTAL.textContent = nutsTotal;
};

const timeout = (worker) => {
  console.log(worker);
  setTimeout(function() {
    worker.work();
    render();
    timeout();
  }, time)
}
/*----- event listeners -----*/
homeTab.addEventListener('click', homeHandle);
scienceTab.addEventListener('click', scienceHandle);