const outputDiv = document.getElementById("result-output")

let touchscreen = false
let wasHit = false

if (window.matchMedia("(pointer: coarse)").matches) {
    touchscreen = true;
    outputDiv.innerText = "Tap to start, tap again to hit!"
    document.getElementById("info").innerText = "Tap to start, tap again to hit!"
    wasHit = true
}

const audioContext = new AudioContext()
let buffer
loadAudio()


document.addEventListener("keydown", keydown);
document.addEventListener("touchstart", touchstart);
document.addEventListener("touchend", () => { audioContext.resume() }, { once: true });

function keydown(_ev) {
    if (_ev.key == " ") {
        restart()
    } else {
        hit()
    }
}

function touchstart() {
    if (wasHit) {
        restart()
    } else {
        hit();
    }
}

async function loadAudio() {
    const response = await fetch("sound.mp3");
    buffer = await audioContext.decodeAudioData(await response.arrayBuffer())
}

const target_time = 12.15

let source
let startTime = 0
function restart() {
    if (source) {
        source.stop()
        source.disconnect()
    }

    if (highscoreEnabled)
        currentName = prompt("Name", currentName).trim()
    source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0)
    startTime = audioContext.currentTime
    wasHit = false
    outputDiv.classList.remove("late", "early", "way-too")
    outputDiv.innerText = "..."
    highscoreWrapper.hidden = true
}

function hit() {
    if (wasHit) return
    wasHit = true
    let result = target_time - (audioContext.currentTime - startTime)
    console.log("hit", result)
    outputDiv.innerText = (result).toFixed(3) + "s"
    if (result < 0) {
        outputDiv.classList.add("late");
    } else {
        outputDiv.classList.add("early");
        if (result > 3) {
            outputDiv.classList.add("way-too");
        }
    }
    highscoreWrapper.hidden = false
    if (highscoreEnabled && currentName) {
        addToHighscore(currentName, result)
    }
}

update()
function update() {
    requestAnimationFrame(update)
    if (!audioContext) return
    let currentTime = target_time - (audioContext.currentTime - startTime)
    if (currentTime < 0)
        outputDiv.classList.add("late")
}

let highscoreEnabled = false
const highscores = loadHighscore()
let currentName = ""

updateHighscoreList()
toggleHighscore(document.getElementById("highscore-toggle").checked)

function loadHighscore() {
    var text = localStorage.getItem("highscore")
    if (!text) return {}
    try {
        let obj = JSON.parse(text)
        return obj
    } catch (error) {
        return {}
    }
}

function getSortedHighscoreArray() {
    let arr = []
    for (let name in highscores) {
        arr.push([name, highscores[name]])
    }

    arr.sort((a, b) => isABetterThanB(a[1], b[1]))

    return arr
}

/* Returns -1 if a is better in this highscore, 1 if not, 0 if equal */
function isABetterThanB(a, b) {
    // -1 -> a < b
    //  1 -> a > b
    if (a > 0 && b > 0)
        return a - b
    if (a < 0 && b < 0)
        return b - a
    if (a < 0) return 1
    if (b < 0) return -1
    return 0
}


function saveHighscore() {
    localStorage.setItem("highscore", JSON.stringify(highscores))
}

const highscoreWrapper = document.getElementById("highscore")
const highscoreToggle = document.getElementById("highscore-toggle")
highscoreToggle.addEventListener("change", (ev) => {
    toggleHighscore(ev.target.checked)
})

function toggleHighscore(on) {
    highscoreEnabled = on;
    document.getElementById("highscore-list").hidden = !on;
}

function addToHighscore(name, time) {
    // is already in list?
    let prevTime = highscores[name]
    if (prevTime && isABetterThanB(time, prevTime) > 0) {
        updateHighscoreList()
        return
    }
    highscores[name] = time
    updateHighscoreList(name)
    saveHighscore()
}

function updateHighscoreList(current = ""){
    const maxAmount = 5;
    let highscoreArr = getSortedHighscoreArray()
    let elemArr = []
    for(let i = 0; i < maxAmount && i < highscoreArr.length; i++) {
        let elem = document.createElement("li")
        elem.innerText = `${i + 1}. ${highscoreArr[i][1].toFixed(3)}s ${highscoreArr[i][0]}`
        if (highscoreArr[i][0] == current)
            elem.classList.add("current-score")
        elemArr.push(elem)
    }
    if (current){
        let index = highscoreArr.findIndex((v) => v[0] == current)
        if (index > maxAmount - 1) {
            let extra = document.createElement("li")
            extra.classList.add("current-score", "extra-score")
            extra.innerText = `${index + 1}. ${highscoreArr[index][1].toFixed(3)}s ${highscoreArr[index][0]}`
            elemArr.push(extra)
        }
    }
    let listElement = document.getElementById("highscore-list");
    listElement.replaceChildren(...elemArr)
}