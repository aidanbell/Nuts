// JS for page tabs
/*----------  ----------*/

const nav = document.querySelector("nav");

let foo = (evt) => {
  document.querySelector(".tab-content.active").classList.replace("active", "hidden");
  document
    .querySelector(`#${evt.target.id}-content`)
    .classList.replace("hidden", "active");
  document.querySelector(".tabs.active").classList.remove("active");
  evt.target.classList.add("active");
};

nav.addEventListener("click", foo);

class JobSite {
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
    nutsTotal += (this.value * this.multi * this.owned) / this.time;
    nutsRunning += (this.value * this.multi * this.owned) / this.time;
  };

  doThing = () => {
    nutsTotal += 100;
  };
}

class Squirrel {
  static id = 0;
  constructor() {
    this._id = ++Squirrel.id
    this.employed = false;
    this.jobSite = null;
    this.total = 0;
  }
}


/*------ APP'S STATE --------*/
let POP = {
  jobless: [],
  jobSite1: []
}
let nutsTotal = 10;
let nutsRunning = 0;
let getButton = {
  value: 1,
  mult: 1,
};

let goldNuts = {
  total: 0,
  multi: 0.12,
};


/*---------- GET NUTS BUTTON ----------*/
const getNuts = () => {
  nutsTotal += getButton.value * getButton.mult;
  nutsRunning += getButton.value * getButton.mult;
};

/*---------- CACHED ELEMENTS ----------*/

let TOTAL = document.querySelector("#total");

const homeTab = document.querySelector("#home-content");
const populationTab = document.querySelector("#population-content");
const hibernateTab = document.querySelector("#hibernate-content");
const jobsiteTab = document.querySelector("#jobsite-content");

/*---------- HELPER FUNCTIONS ----------*/
const numFormat = (num) => {
  let base = Math.floor(num).toString();
  if (base.length < 4) return `${base}`;
  if (base.length < 7) return `${(num / Math.pow(10, 3)).toFixed(2)}k`;
  if (base.length < 10) return `${(num / Math.pow(10, 6)).toFixed(2)}m`;
  if (base.length < 13) return `${(num / Math.pow(10, 9)).toFixed(2)}b`;
  if (base.length < 16) return `${(num / Math.pow(10, 12)).toFixed(2)}t`;
  if (base.length < 19) return `${(num / Math.pow(10, 15)).toFixed(2)}q`;
};

/*---------- EVENT HANDLERS ----------*/

const homeHandle = (e) => {
  if (e.target.id === "get-nuts") {
    getNuts();
  }
};

const jobsiteHandler = (e) => {
  jobsiteDisplay(jobs[parseInt(e.target.id[1])])
}

function jobsiteDisplay(job) {
  jbPlaceholder.innerHTML = `<h1>${job.name}</h1>
                             <h3>${job.workers.length}/${job.capacity}</h3>`;
}

/*---------- JOBS ----------*/
const squirrelJobRender = (squirrel, nut = false) => {
  let div = document.createElement('div')
  div.id = `s-${squirrel._id}`
  div.className = 'job-square'
  div.innerHTML = "🐿️";
  if (nut) {
    let found = document.createElement('div')
    found.classList.add('hidden', 'found')
    found.id = `f-${squirrel._id}`
    found.innerHTML = "🥜";
    div.append(found)
  }
  return div
}

const chance = (per) => {
  let x = Math.random();
  if (x < per) return true;
  return false;
}


const jobless = () => {
  if (TICK % 500 === 0) {
    console.log('did?')
    POP.jobless.forEach(s => {
      if (chance(0.2)) findNut(s);
    })
  }
}

const findNut = (s) => {
  s.total++;
  nutsTotal++;
  nutsRunning++;
  let nut = document.getElementById(`f-${s._id}`)
  nut.classList.replace("hidden", "found-animation");
  setTimeout(function() {
    nut.classList.replace("found-animation", "hidden")
  }, 600)
}

const work = () => {
  jobless();
}

/*---------- JOBSITE RENDERING ----------*/
const jbPlaceholder = document.getElementById('jobsite-card')
const jbBuy = document.getElementById('jobsite-buy')


// temp jobsite array until I feel like fucking with the class
let jobs = [
  {
    name: "Gatherer",
    capacity: 0,
    workers: [],
    time: 1000,
    multi: 1,
    level: 0,
    cost: 20,
    value: 1,
  },
  {
    name: "Scavenger",
    capacity: 0,
    workers: [],
    time: 1000,
    multi: 1,
    level: 0,
    cost: 20,
    value: 1,
  },
];
// (this.value * this.multi * this.workers.length) / this.time



/*---------- MAIN GAME LOOP ---------*/
const render = () => {
  TOTAL.textContent = numFormat(nutsTotal);
  document.querySelector("#debug-total").textContent =
  Math.round(nutsTotal * 1000) / 1000;
  document.querySelector("#nuts-running").textContent =
  Math.round(nutsRunning * 1000) / 1000;
};

let CLOCK = document.getElementById("clock");
let TICK = 0;
let timer = {
  ms: 0,
  s: 0,
  m: 0,
};
const clock = () => {
  TICK++
  CLOCK.innerHTML = `${timer.m <= 9 ? "0" + timer.m : timer.m}:${
    timer.s <= 9 ? "0" + timer.s : timer.s
  }:${timer.ms <= 9 ? "0" + timer.ms : timer.ms}`;
  if (timer.ms == 99) {
    timer.s++;
    timer.ms = 0;
  }
  if (timer.s == 59) {
    timer.m++;
    timer.s = 0;
  }
  timer.ms++;
};

window.setInterval(clock, 10);

window.setInterval(function () {
  work();
  render();
}, 10);

const initGame = () => {
  for (let i = 0; i < 5; i++) {
    POP.jobless.push(new Squirrel)
  }

  POP.jobless.forEach(s => {
    document.getElementById('jobless').append(squirrelJobRender(s, true))
    document.getElementById("job-available").append(squirrelJobRender(s));
  })
  let str = '';
  jobs.forEach((j, i) => {
    str += `<button id="j${i}" class="button">${j.name}</button>`
  })
  jbBuy.innerHTML = str
}

initGame();
// 🐿️
// 🥜

homeTab.addEventListener("click", homeHandle);
jobsiteTab.addEventListener("click", jobsiteHandler)