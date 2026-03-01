const outputDiv = document.getElementById("result-output")

let touchscreen = false
if(window.matchMedia("(pointer: coarse)").matches) {
    touchscreen = true;
    outputDiv.innerText = "Tap to start, tap again to hit!"
    document.getElementById("info").innerText = "Tap to start, tap again to hit!"
}

const audioContext = new AudioContext()
let buffer
loadAudio()


document.addEventListener("keydown", keydown);
document.addEventListener("touchstart", touchstart);

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
let wasHit = false
function restart() {
    if (source) {
        source.stop()
        source.disconnect()
    }
    source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0)
    startTime = audioContext.currentTime
    wasHit = false
    outputDiv.classList.remove("late", "early", "way-too")
    outputDiv.innerText = "..."
}

function hit() {
    if (wasHit) return
    wasHit = true
    let result =  target_time - (audioContext.currentTime - startTime)
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
}

update()
function update() {
    requestAnimationFrame(update)
    let currentTime = target_time - (audioContext.currentTime - startTime)
    if(currentTime < 0)
    outputDiv.classList.add("late")
}