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
  gather: 10,
  shakeTree: 100,
}

var gameData = {
  nuts: 0,

}

var gatherData = {
  perClick: 1,
  buyCost: 10,
  level: 0,
  nutsTimeCost: 100,
  nutsTimeLevel: 1,
}

//var mainGameLoop = window.setInterval(function() {
//  getNuts()
//}, 100)

function getNuts() {
  setTimeout(gather, (speed.gather * 100));
}
function gather() {
    Math.round(gameData.nuts += gatherData.perClick);
    document.getElementById('nutsTotal').innerHTML = Math.round(gameData.nuts) + " Total Nuts";
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
