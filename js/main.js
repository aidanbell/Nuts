const nav = document.querySelector('nav')

console.log(nav)


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

/*----- app's state (variables) -----*/
let nutsTotal;

let getButton = {
  value: 1,
  mult: 1
}

/*----- cached element references -----*/
/*----- event listeners -----*/
/*----- functions -----*/
