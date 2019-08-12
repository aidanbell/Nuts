function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName('tabcontent');
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


function move() {
  var elem = document.getElementById("myBar");
  var width = 1;
  var id = setInterval(frame, 10);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
    } else {
      width++;
      elem.style.width = width + '%';
    }
  }
}

var gameData = {
  nuts: 0,
  nutsPerClick: 1,
  nutsPerClickCost: 10,
  nutsTimeCost: 100,
  nutsTimeLevel: 1
}

var mainGameLoop = window.setInterval(function() {
  getNuts()
}, 100)

function getNuts() {
    gameData.nuts += gameData.nutsPerClick
    document.getElementById('nutsTotal').innerHTML = gameData.nuts + " Total Nuts"
}

function getNutsBulk() {

}

function buyNutsPerClick() {
  if (gameData.nuts >= gameData.nutsPerClickCost) {
    gameData.nuts -= gameData.nutsPerClickCost
    gameData.nutsPerClick += 1
    gameData.nutsPerClickCost *= 2
    document.getElementById('nutsTotal').innerHTML = gameData.nuts + " Total Nuts"
    document.getElementById('perClickUpgrade').innerHTML = "Upgrade Nuts (Currently Level " + gameData.nutsPerClick + ") Cost: " + gameData.nutsPerClickCost + " Nuts"
  }
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
