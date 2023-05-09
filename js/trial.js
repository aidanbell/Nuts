// JS for page tabs
/*----------  ----------*/

const nav = document.querySelector("nav");

let foo = (evt) => {
  if (evt.target.classList.contains('locked')) return;
  renderJobsites()
  document.querySelector(".tab-content.active").classList.replace("active", "hidden");
  document
    .querySelector(`#${evt.target.id}-content`)
    .classList.replace("hidden", "active");
  document.querySelector(".tabs.active").classList.remove("active");
  evt.target.classList.add("active");
  // This would be a great place to do checks
  // Check THRESHOLDs for what should be hidden/locked

};

nav.addEventListener("click", foo);

class JobSite {
  constructor(name, time, cost, value) {
    this.name = name;
    this.time = time;
    this.baseCost = cost;
    this.cost = cost;
    this.value = value;
    this.multi = 1;
    this.owned = 0;
    this.workers = [];
    this.capacity = 0;
    this.running = false;
  }

  work = () => {
    nutsTotal += (this.value * this.multi * this.workers.length);
    nutsRunning += (this.value * this.multi * this.workers.length);
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
    this.job = null;
    this.total = 0;
    this.born = TICK;
    this.workRate = 2
  }
}


/*------ APP'S STATE --------*/
let POP = {
  jobless: [],
  thinkers: [],
  jobs: {
    gatherer: [],
    scavenger: [],
  }
}
let nutsTotal = 0;
let nutsRunning = 0;
let thoughtStats = {
  speed: 1000,
  multi: 1,
};
let thoughtsRunning = 0;
let thoughtsTotal = 0;
let getButton = {
  value: 1,
  mult: 1,
};

let goldNuts = {
  total: 0,
  multi: 0.12,
};

const jobs = [
  new JobSite("Gatherer", 1000, 10, 1),
  new JobSite("Scavenger", 5000, 100, 10),
];


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


const jobsiteHandler = (e) => {
  console.log(e.currentTarget)
  jobsiteDisplay(jobs[parseInt(e.target.id[1])])
}

function jobsiteDisplay(job) {
  jbPlaceholder.innerHTML = `<h1>${job.name}</h1>
                             <h3>${job.workers.length}/${job.capacity}</h3>`;
}

document.querySelector('#thinkings-content .add-squirrel-icon').addEventListener('click', assignThinker)

/*---------- HOME ----------*/
function addNewSquirrel() {
  let s = new Squirrel();
  POP.jobless.push(s);
  document.getElementById('jobless').append(squirrelJobRender(s, true))
}

/*---------- THINKING ----------*/
function assignThinker() {
  let s = POP.jobless.shift();
  s.job = "Thinker";
  s.employed = true;
  POP.thinkers.push(s);
  document.getElementById("thinkers").append(squirrelJobRender(s));
}

function thinkers() {
  if (TICK % thoughtStats.speed === 0) {
    POP.thinkers.forEach((s) => {
      thoughtsTotal += s.workRate;
      thoughtsRunning += s.workRate;
    });
  }
}

/*---------- JOBS ----------*/
const squirrelJobRender = (squirrel, nut = false) => {
  let squIcon = document.createElement('div')
  squIcon.id = `s-${squirrel._id}`
  squIcon.className = 'icon'
  squIcon.innerHTML = "🐿️";
  
  if (squirrel.job == 'Gatherer') {
    let jobIcon = document.createElement('div')
    jobIcon.className = 'job-icon'
    jobIcon.innerHTML = "🌲";
    squIcon.append(jobIcon)
  }
  if (squirrel.job == 'Thinker') {
    let hat = document.createElement('div')
    hat.className = 'hat-icon'
    hat.innerHTML = "🎓";
    squIcon.append(hat)
  }
  if (nut) {
    let found = document.createElement('div')
    found.classList.add('hidden', 'found')
    found.id = `f-${squirrel._id}`
    found.innerHTML = "🥜";
    squIcon.append(found)
  }
  if (!squirrel.employed) return squIcon
  let removeIcon = document.createElement('div')
  removeIcon.className = 'remove-icon'
  removeIcon.innerHTML = "❌";
  squIcon.append(removeIcon)
  return squIcon
}

const chance = (per) => {
  let x = Math.random();
  if (x < per) return true;
  return false;
}


const jobless = () => {
  POP.jobless.forEach(s => {
    if (TICK % (120 / s.workRate) === 0) {
      if (chance(0.2)) findNut(s);
      if (chance(0.1)) twitcher(s)
    }
  })
}

function workers() {
  jobs.forEach(job => {
    if (TICK % job.time === 0) {
      job.work();
    }
  })
}

const findNut = (s) => {
  s.total++;
  nutsTotal++;
  nutsRunning++;
  let nut = document.getElementById(`f-${s._id}`)
  nut.classList.replace("hidden", "found-animation");
  nut.style.left = `${Math.floor(Math.random() * 50)}%`
  setTimeout(function() {
    nut.classList.replace("found-animation", "hidden")
    nut.style.left = 0;
  }, 600)
}

function twitcher(s) {
  document.getElementById(`s-${s._id}`).classList.toggle('mirror')
}

const work = () => {
  jobless();
  workers();
  thinkers();
}

function removeSquirrel(s) {
  POP.jobless = POP.jobless.filter(squ => squ._id !== s._id)
  POP.thinkers = POP.thinkers.filter(squ => squ._id !== s._id)
}

/*---------- JOBSITE RENDERING ----------*/
const jobsContainer = document.getElementById("jobs-container");
const jbBtns = document.querySelectorAll('.jobsite-btn')
// (this.value * this.multi * this.workers.length) / this.time

//this needs to be added to render logic
function renderBtns() {
  jobs.forEach((job, idx) => {
    jobsContainer.append(buildJobsite(job, idx))
  })
}


function renderJobsites() {
  // Render Jobless
  document.getElementById('jobless').innerHTML = "";
  POP.jobless.forEach(s => {
    document.getElementById('jobless').append(squirrelJobRender(s, true))
    document.getElementById("job-available").append(squirrelJobRender(s));
  })
  // Render Jobs
  jobs.forEach((job, idx) => {
    document.getElementById(`jobsite-jobs-${idx}`).innerHTML = "";
    job.workers.forEach(s => {
      document.getElementById(`jobsite-jobs-${idx}`).append(squirrelJobRender(s));
    })
  })
}


/*---------- JOBSITE LOGIC ---------*/

function handleBuy(idx) {
  let job = jobs[idx]
  if (!POP.jobless.length) return;
  if (nutsTotal < job.cost) return;
  nutsTotal -= job.cost;
  job.cost = Math.floor(job.cost * 1.2);
  job.capacity++;
  let squirrel = POP.jobless.pop();
  squirrel.job = job.name;
  squirrel.employed = true;
  job.workers.push(squirrel);
  // let div = document.getElementById(`jobsite-${idx}`)
  // div.append(squirrelJobRender(squirrel))
  renderJobsites();
}

function handleRemove(idx) {
  test();
}

/*---------- CHECKS ---------*/
let THRESHOLD = 0;

function checks() {
  storyCheck();
}

function storyCheck() {
  if (nutsTotal >= 10 && reportIdx === 2) {
    playNextReport();
    addNewSquirrel();
    THRESHOLD++;
  }
  if (nutsTotal >= 25 && reportIdx === 3) {
    playNextReport();
    unlocker()
    thoughtsTotal += 10
    thoughtsRunning += 10
    document.querySelector('.thoughts-display').classList.remove('hidden')
    THRESHOLD++;
  }
}

function unlocker() {
  switch(THRESHOLD) {
    case 1:
      let tab = document.getElementById('thinkings')
      tab.classList.replace('locked', 'unlocked')
      tab.textContent = 'Thinkings'
  }
}


/*---------- MAIN GAME LOOP ---------*/
const render = () => {
  TOTAL.textContent = numFormat(nutsTotal);
  document.querySelector("#debug-total").textContent =
  Math.round(nutsTotal * 1000) / 1000;
  document.querySelector("#nuts-running").textContent =
  Math.round(nutsRunning * 1000) / 1000;
  document.querySelector('#thoughts-total').textContent = thoughtsTotal;
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

// window.setInterval(clock, 10);


const initGame = () => {
  // for (let i = 0; i < 4; i++) {
    //   POP.jobless.push(new Squirrel)
    // }
    POP.jobless.push(new Squirrel)
    
    POP.jobless.forEach(s => {
      document.getElementById('jobless').append(squirrelJobRender(s, true))
      document.getElementById("job-available").append(squirrelJobRender(s));
    })
    renderBtns();

    window.setInterval(function () {
      clock();
      work();
      render();
      checks()
    }, 10);
}

// initGame();
// 🐿️
// 🥜


// jobsiteTab.addEventListener("click", jobsiteHandler)