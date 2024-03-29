// JS for page tabs

const nav = document.querySelector('nav')

let foo = (evt) => {
  document.querySelector('.tab-content.active').classList.replace('active', 'hidden');
  document.querySelector(`#${evt.target.id}-content`).classList.replace('hidden', 'active');
  document.querySelector('.tabs.active').classList.remove('active');
  evt.target.classList.add('active');
}

nav.addEventListener('click', foo)


// JS for Building Tab Menu

const buildNav = document.getElementById("building-buy");

const buildNavHandle = (e) => {
  
}

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
    this.baseCost = cost;
    this.cost = cost;
    this.value = value;
    this.multi = 1;
    this.owned = 0;
    this.running = false;
  }

  work = () => {
    nutsTotal += ((this.value * this.multi) * this.owned / this.time);
    nutsRunning += ((this.value * this.multi) * this.owned / this.time);
  }

  doThing = () => {
    nutsTotal += 100
  }
}

/*----- app's state (variables) -----*/
let nutsTotal = 0;
let nutsRunning = 0;

let goldNuts = {
  total: 0,
  multi: 0.12,
}

// For mainGameLoop

let timerFunctions = [];
let secretFunctions = [];

let getButton = {
  value: 1,
  mult: 1
}


// const loopFunctions = ()

// timerFunctions.forEach(button => button.doThing());


/*----- cached element references -----*/
let TOTAL = document.querySelector('#total');

const homeTab = document.querySelector('#home-content');
const scienceTab = document.querySelector('#science-content');
const hibernateTab = document.querySelector('#hibernate-content')
const buildTab = document.querySelector('#build-content')

const create = (thing) => {
  if (thing === "worker") {
    document.createElement(button)
  }
}

/*----- functions -----*/
const priceCheck = (worker) => {
  if (nutsTotal >= worker.cost) {
    return true
  }
  return false;
}

// 1,000,000,000,000,000
// 1*10^9  === Billion === 1,000,000,000
// 1*10^12 === Trillion === 1,000,000,000,000
// 1*10^15 === Quadrillion === 1,000,000,000,000,000

const numFormat = (num) => {
  let base = Math.floor(num).toString()
  if (base.length < 4) return `${base}`;
  if (base.length < 7) return `${(num / Math.pow(10, 3)).toFixed(2)}k`;
  if (base.length < 10) return `${(num / Math.pow(10, 6)).toFixed(2)}m`;
  if (base.length < 13) return `${(num / Math.pow(10, 9)).toFixed(2)}b`;
  if (base.length < 16) return `${(num / Math.pow(10, 12)).toFixed(2)}t`;
  if (base.length < 19) return `${(num / Math.pow(10, 15)).toFixed(2)}q`;
}

const check = (worker, nuts) => {
  if (nutsTotal >= nuts && document.querySelector(`.${worker}-div`).classList.contains('hidden')) {
    return true;
  } else {
    return false;
  }
}


/*-- THE REFACTOR IS LIVE --*/

const checkSci = () => {}

const initGame = () => {
  nutsTotal = 5;

  timerFunctions = [];
  secretFunctions = [];

  getButton = {
    value: 1,
    mult: 1
  }
  w1Button = new WorkerButton(1000, 4, 1);
  w2Button = new WorkerButton(1000, 60, 5);
  w3Button = new WorkerButton(1000, 900, 10);
  w4Button = new WorkerButton(1000, 13500, 50);

  timerFunctions = [w1Button, w2Button, w3Button, w4Button]

  document.querySelectorAll('.row').forEach(n => {
    n.classList.add("hidden")
  });
  document.querySelectorAll('.worker-button').forEach(n => {
    n.disabled = true
  });
  document.querySelectorAll('.worker-button > .cost').forEach((n, i) => {
    n.textContent = numFormat(timerFunctions[i].cost)
  })
  document.querySelectorAll('.worker-button > .owned').forEach((n, i) => {
    n.textContent = timerFunctions[i].owned
  })
}

const show = () => {
  if (check('w1', 0) === true) {
    document.querySelector('.w1-div').classList.remove("hidden");
    return;
  }
  if (priceCheck(w1Button)) {
    document.querySelector('#buy-w1').disabled = false;
  }
  if (nutsTotal < 60) return;
  if (check('w2', 60) === true) {
    document.querySelector('.w2-div').classList.remove('hidden');
    return;
  }
  if (priceCheck(w2Button)) {
    document.querySelector('#buy-w2').disabled = false;
  }
  if (nutsTotal < 800) return;
  if (check('w3', 800) === true) {
    document.querySelector('.w3-div').classList.remove("hidden");
    return;
  }
  if (priceCheck(w3Button)) {
    document.querySelector('#buy-w3').disabled = false;
  }
  if (nutsTotal < 1200) return;
  if (check('w4', 1200) === true) {
    document.querySelector('.w4-div').classList.remove('hidden');
    timerFunctions.push(w4Button)
    return;
  }
  if (priceCheck(w4Button)) {
    document.querySelector('#buy-w4').disabled = false;
  }
};



const render = () => {
  TOTAL.textContent = numFormat(nutsTotal);
  document.querySelector('#debug-total').textContent = Math.round(nutsTotal * 1000) / 1000;
  document.querySelector('#nuts-running').textContent = Math.round(nutsRunning * 1000) / 1000;
}



const homeHandle = (evt) => {
  if (evt.target.id === 'get-nuts') {
    getNuts()
  };
  if (evt.target.id === 'buy-w1') {
    if (nutsTotal >= w1Button.cost) {
      nutsTotal -= w1Button.cost;
      w1Button.cost = w1Button.cost * Math.pow(1.07, w1Button.owned)
      w1Button.owned += 1;
      if (w1Button.owned === 10 || w1Button.owned === 25 || w1Button.owned === 50 || w1Button.owned % 100 === 0) {
        w1Button.value *= 2
      }
      makeBarGo();
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${numFormat(w1Button.cost)}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${w1Button.owned}`
      document.querySelector('#w1-indicator').textContent = `${Math.round(((w1Button.value * w1Button.multi * w1Button.owned / w1Button.time) * 100) * 10) /10}/sec`
    }
  }
  if (evt.target.id === 'buy-w2') {
    if (nutsTotal >= w2Button.cost) {
      nutsTotal -= w2Button.cost;
      w2Button.cost = w2Button.cost * Math.pow(1.07, w2Button.owned)
      w2Button.owned += 1;
      if (w2Button.owned === 10 || w2Button.owned === 25 || w2Button.owned === 50 || w2Button.owned % 100 === 0) {
        w2Button.value *= 2
      }
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${numFormat(w2Button.cost)}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${w2Button.owned}`
      document.querySelector('#w2-indicator').textContent = `${Math.round(((w2Button.value * w2Button.multi * w2Button.owned / w2Button.time) * 100) * 10) /10}/sec`
    }
  }
  if (evt.target.id === 'buy-w3') {
    if (nutsTotal >= w3Button.cost) {
      nutsTotal -= w3Button.cost;
      w3Button.cost = Math.floor(w3Button.cost * 1.09)
      w3Button.owned += 1;
      if (w3Button.owned === 10 || w3Button.owned === 25 || w3Button.owned === 50 || w3Button.owned % 100 === 0) {
        w3Button.value *= 2
      }
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${numFormat(w3Button.cost)}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${w3Button.owned}`
      document.querySelector('#w3-indicator').textContent = `${Math.round(((w3Button.value * w3Button.multi * w3Button.owned / w3Button.time) * 100) * 10) /10}/sec`
    }
  }
  if (evt.target.id === 'buy-w4') {
    if (nutsTotal >= w4Button.cost) {
      nutsTotal -= w4Button.cost;
      w4Button.cost = Math.floor(w4Button.cost * 1.11)
      w4Button.owned += 1;
      if (w4Button.owned === 10 || w4Button.owned === 25 || w4Button.owned === 50 || w4Button.owned % 100 === 0) {
        w4Button.value *= 2
      }
      document.querySelector(`#${evt.target.id} > .cost`).textContent = `${numFormat(w4Button.cost)}`;
      document.querySelector(`#${evt.target.id} > .owned`).textContent = `${w4Button.owned}`
      document.querySelector('#w4-indicator').textContent = `${Math.round(((w4Button.value * w4Button.multi * w4Button.owned / w4Button.time) * 100) * 10) /10}/sec`
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

const hibernateHandle = (evt) => {
  if (evt.target.id === 'hibernate') {
    document.querySelector('#hibernate-info').classList.remove('hidden')
    document.querySelector('#gn-preview').textContent = `${goldNutPre()} Gold Nuts.`
  }
  if (evt.target.id === 'hibernate-confirm') {
    hibernate();
  }
}

const makeBarGo = () => {
  let bar = document.getElementById('w1-progress')
  let w = bar.style.width.slice(0, -1)
  let id = setInterval(function() {
    if (w == 100) {
      w = 0;
      // w1Button.doThing();
    }
    w++
    bar.style.width = w + '%'
  }, 100)
}

const getNuts = () => {
  nutsTotal += (getButton.value * getButton.mult);
  nutsRunning += (getButton.value * getButton.mult);
  render();
};

const goldNutPre = () => {
  return Math.floor(nutsRunning / Math.pow(10, 6) * goldNuts.multi);
}

const hibernate = () => {
  goldNuts.total += nutsRunning / Math.pow(10, 6) * goldNuts.multi;
  initGame();
}

let CLOCK = document.getElementById('clock')
let timer = {
  ms: 0,
  s: 0,
  m: 0,
};
const clock = () => {
  CLOCK.innerHTML = `${timer.s}:${timer.ms}`
  if (timer.ms == 99) {
    timer.s++
    timer.ms = 0
  }
  if (timer.s == 59) {
    timer.m++
    timer.s = 0
  }
  timer.ms ++
}

window.setInterval(clock, 10)

window.setInterval(function() {
  timerFunctions.forEach(button => button.work());
  show();
  render();
}, 10)

initGame();

/*----- event listeners -----*/
homeTab.addEventListener('click', homeHandle);
scienceTab.addEventListener('click', scienceHandle);
hibernateTab.addEventListener('click', hibernateHandle);