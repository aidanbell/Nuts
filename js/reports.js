let reportEl = document.querySelector("#reports");
let reportBodyEl = document.querySelector("#report-body");
let reportSmallEl = document.querySelector("#report-small");

let reports = [
  // This was kinda fucked up copilot
  // do better
  
  // "You wake up in a cold sweat. You were dreaming about squirrels. 
  // You look around your room and see that you are alone. You are not a squirrel. 
  // You are a human. You are a human who is obsessed with squirrels. 
  // You are a human who is obsessed with squirrels and you have been working on a game 
  // about squirrels for the past 3 months. You are a human who is obsessed with squirrels 
  // and you have been working on a game about squirrels for the past 3 months and you are 
  // starting to lose your mind. You are a human who is obsessed with squirrels and you have 
  // been working on a game about squirrels for the past 3 months and you are starting to lose"


  "You wake up in a small clearing. The world is quiet. You're all alone. You'll have to begin to gather nuts for the months ahead.",
  "You stand up, stretch your little squirrel arms, and start lazily searching the clearing for nuts",
  "You hear a rustle in the bushes. A compatriot. Two heads are better than one. They get to work checking the clearing with you.",
  "A clunk on the head rouses you from your work, and knocks you on your tail. Amongst the stars spinning around your ears, you see visions of structure, organization, machines, and a better life. You have been blessed with the gift of head-pictures."
]
let reportIdx = 0

function playNextReport() {
  reportBodyEl.textContent = reports[reportIdx]
  reportSmallEl.textContent = "Click to dismiss"
  reportEl.addEventListener('click', dismissReport)
  reportIdx++
}

function dismissReport() {
  reportEl.classList.add('fade-out')
  reportEl.removeEventListener('click', dismissReport)
  setTimeout(() => {
    reportBodyEl.textContent = ""
    reportSmallEl.textContent = ""
    reportEl.classList.remove('fade-out')
    if (reportIdx === 2) {
      initGame()
    }
    if (reportIdx < 2) {
      playNextReport()
    }
  }, 200)
}
playNextReport()