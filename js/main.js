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

class Button {
  constructor(field, effects, cost) {
    this.field = field;
    this.effects = effects;
    this.cost = cost;
    this.value = 1;
    this.multi = 1;
  }
};

/*----- app's state (variables) -----*/
let nutsTotal = 0;

let getButton = {
  value: 1,
  mult: 1
}


/*----- cached element references -----*/
let TOTAL = document.querySelector('#total');

const homeTab = document.querySelector('#home-content');
const scienceTab = document.querySelector('#science-content');

/*----- functions -----*/
const show = () => {
  if (getValButton) return;

  switch (nutsTotal) {
    case 50:
      let upGetButton = new Button('science', 'getVal', 50);
      break;
  }
};


const homeHandle = (evt) => {
  if (evt.target.id === 'get-nuts') {
    console.log('nuts');
    getNuts()
  };
};

const scienceHandle = (evt) => {
  if (evt.target.id === 'get-val') {
    console.log(this);
    if (nutsTotal < upGetButton.cost) return;
    getButton.value += upGetButton.value;
    nutsTotal -= upGetButton.cost;
    TOTAL.textContent = nutsTotal;
    upGetButton.cost = Math.floor(upGetButton.cost * 1.1);
  }
}

const getNuts = () => {
  nutsTotal += (getButton.value * getButton.mult);
  TOTAL.textContent = nutsTotal;
};
/*----- event listeners -----*/
homeTab.addEventListener('click', homeHandle);
scienceTab.addEventListener('click', scienceHandle);
