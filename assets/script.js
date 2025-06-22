// Sound alert
function playSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}

// elements for custom durations
const inputStudy = document.getElementById("inputStudy");
const inputShort = document.getElementById("inputShort");
const inputLong = document.getElementById("inputLong");

// cycle counters
let shortBreakCount = 0;
const maxShortBreaksBeforeLong = 4;

// timer factory with onFinish callback
function createTimer(displayElement, onFinish) {
    let remaining = 0;
    let intervalId = null;
    let originalDuration = 0;

    function updateDisplay() {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        displayElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return {
        start(durationMinutes) {
            if (intervalId) clearInterval(intervalId);
            originalDuration = durationMinutes * 60;
            remaining = originalDuration;
            updateDisplay();

            intervalId = setInterval(() => {
                if (remaining <= 0) {
                    clearInterval(intervalId);
                    displayElement.textContent = "⏰ Time's up!";
                    playSound();
                    if (onFinish) onFinish();
                    return;
                }
                remaining--;
                updateDisplay();
            }, 1000);
        },
        pause() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },
        resume() {
            if (!intervalId && remaining > 0) {
                intervalId = setInterval(() => {
                    if (remaining <= 0) {
                        clearInterval(intervalId);
                        displayElement.textContent = "⏰ Time's up!";
                        playSound();
                        if (onFinish) onFinish();
                        return;
                    }
                    remaining--;
                    updateDisplay();
                }, 1000);
            }
        },
        reset() {
            if (intervalId) clearInterval(intervalId);
            remaining = originalDuration;
            updateDisplay();
        }
    };
}

// tab switching logic
function showOnly(targetId) {
    document.querySelectorAll(".mode-section").forEach(section => {
        section.classList.remove("active");
    });
    document.getElementById(targetId).classList.add("active");

    document.querySelectorAll(".mode-tabs button").forEach(btn => {
        btn.classList.remove("active");
    });
    document.getElementById("tab-" + targetId).classList.add("active");
}

document.getElementById("tab-study").addEventListener("click", () => showOnly("study"));
document.getElementById("tab-short").addEventListener("click", () => showOnly("short"));
document.getElementById("tab-long").addEventListener("click", () => showOnly("long"));

// displays
const studyDisplay = document.getElementById("studyDisplay");
const shortDisplay = document.getElementById("shortDisplay");
const longDisplay = document.getElementById("longDisplay");

// timers with auto-switching
const studyTimer = createTimer(studyDisplay, () => {
    shortBreakCount = 0;
    showOnly("short");
    shortTimer.start(+inputShort.value);
});

const shortTimer = createTimer(shortDisplay, () => {
    shortBreakCount++;
    if (shortBreakCount >= maxShortBreaksBeforeLong) {
        showOnly("long");
        longTimer.start(+inputLong.value);
        shortBreakCount = 0;
    } else {
        showOnly("study");
        studyTimer.start(+inputStudy.value);
    }
});

const longTimer = createTimer(longDisplay, () => {
    showOnly("study");
    studyTimer.start(+inputStudy.value);
});

// buttons for study timer

document.getElementById("startStudy").addEventListener("click", () => studyTimer.start(+inputStudy.value));
document.getElementById("pauseStudy").addEventListener("click", () => studyTimer.pause());
document.getElementById("resumeStudy").addEventListener("click", () => studyTimer.resume());
document.getElementById("resetStudy").addEventListener("click", () => studyTimer.reset());

// buttons for short break timer

document.getElementById("startShort").addEventListener("click", () => shortTimer.start(+inputShort.value));
document.getElementById("pauseShort").addEventListener("click", () => shortTimer.pause());
document.getElementById("resumeShort").addEventListener("click", () => shortTimer.resume());
document.getElementById("resetShort").addEventListener("click", () => shortTimer.reset());

// buttons for long break timer

document.getElementById("startLong").addEventListener("click", () => longTimer.start(+inputLong.value));
document.getElementById("pauseLong").addEventListener("click", () => longTimer.pause());
document.getElementById("resumeLong").addEventListener("click", () => longTimer.resume());
document.getElementById("resetLong").addEventListener("click", () => longTimer.reset());
