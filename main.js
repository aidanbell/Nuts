function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();

// should add in scripts that run on load
//      -price checker to disable things you can't afford
//      -things to hide/reveal tabs until checkpoints

var speed = {
  gather: 100,
  shakeTree: 100,
}

var gameData = {
  nuts: 0,
  goldenNuts: 0,
  upgradeCost: 100,
  speed: 100,
}

var gatherData = {
  perClick: 1,
  buyCost: 10,
  level: 0,
  nutsTimeCost: 100,
  nutsTimeLevel: 1,
  upgraded: false,
}

var mainGameLoop = window.setInterval(function() {
  if (gatherData.upgraded === true) {
    gather();
    //document.getElementById('gatherLoader')  make it spin
  }
}, gameData.speed)

function getNuts() {
  setTimeout(gather, (speed.gather * 100));
}

function plusHundred() {
  gameData.nuts += 100;
  document.getElementById('nutsTotal').innerHTML = Math.round(gameData.nuts) + " Total Nuts";
}

// GATHER BUTTON

function gather() {
    Math.round(gameData.nuts += gatherData.perClick);
    document.getElementById('nutsTotal').innerHTML = Math.round(gameData.nuts) + " Total Nuts";
}

function firstGather() {
  if (gameData.nuts >= gameData.upgradeCost) {
    Math.round(gameData.nuts -= gameData.upgradeCost);
    gatherData.upgraded = true;
    document.getElementById('nutsTotal').innerHTML = Math.round(gameData.nuts) + " Total Nuts";
    document.getElementById('gatherBuy').innerHTML = "BUY";
    document.getElementById('gatherCost').innerHTML = Math.round(gatherData.buyCost);
    document.getElementsByClassName('gatherBuy').removeAttribute("onclick", "firstGather()");
    document.getElementsByClassName('gatherBuy').onclick = function() {buyGather();};
    document.getElementById('gatherCost').innerHTML = Math.round(gatherData.buyCost);
  }
}

function buyGather() {
  if (gameData.nuts >= gatherData.buyCost) {
    if (gatherData.level > 0 && gatherData.level % 10 === 0){
      Math.round(gameData.nuts -= gatherData.buyCost);
      Math.round(gatherData.perClick *= 1.25);
      Math.round(gatherData.buyCost *= 1.25);
      gatherData.level++;
      document.getElementById('nutsTotal').innerHTML = Math.round(gameData.nuts) + " Total Nuts";
      document.getElementById('gatherLevel').innerHTML = gatherData.level;
      document.getElementById('gatherCost').innerHTML = Math.round(gatherData.buyCost);
      document.getElementById('gatherEffect').innerHTML = Math.round(gatherData.perClick);
    } else {
      Math.round(gameData.nuts -= gatherData.buyCost);
      Math.round(gatherData.perClick += 1);
      Math.round(gatherData.buyCost *= 1.25);
      gatherData.level++;
      document.getElementById('nutsTotal').innerHTML = Math.round(gameData.nuts) + " Total Nuts";
      document.getElementById('gatherLevel').innerHTML = gatherData.level;
      document.getElementById('gatherCost').innerHTML = Math.round(gatherData.buyCost);
      document.getElementById('gatherEffect').innerHTML = Math.round(gatherData.perClick);
    }
  }
}



function disableClick() {
}

function getNutsBulk() {

}

function buyEfficiencyUpgrade() {
  if (gameData.nuts >= gameData.nutsTimeCost) {
    gameData.nuts -= gameData.nutsTimeCost
    mainGameLoop *= 0.2
    gameData.nutsTimeCost *= 100
    gameData.nutsTimeLevel ++
    document.getElementById('nutsTotal').innerHTML = gameData.nuts + " Total Nuts"
    document.getElementById('efficiencyUpgrade').innerHTML = "Efficiency Upgrade (Currently Level " + gameData.nutsTimeLevel + ") Cost: " + gameData.nutsTimeCost + " Nuts"
  }
}
