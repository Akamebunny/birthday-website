
/* ==========================
   SHARED SOUND SYSTEM
========================== */

const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");

// Remember sound setting between pages
let soundIsOn = localStorage.getItem("birthdaySounds") !== "off";

const soundFiles = {
    hover: new URL("../audio/scroll.mp3", import.meta.url).href,
    click: new URL("../audio/click.mp3", import.meta.url).href,
    send: new URL("../audio/send.mp3", import.meta.url).href
};

const soundVolumes = {
    hover: 0.25,
    click: 0.4,
    send: 0.45
};

// Prepare sounds
const soundPlayers = {};

for (const soundName in soundFiles) {
    soundPlayers[soundName] = new Audio(soundFiles[soundName]);
    soundPlayers[soundName].preload = "auto";
}

// Play sound
export function playSound(soundName) {

    if (!soundIsOn) return;

    const originalSound = soundPlayers[soundName];

    if (!originalSound) return;

    const audio = originalSound.cloneNode();

    audio.volume = soundVolumes[soundName];

    audio.play().catch(error => {
        console.warn("Sound could not play:", error);
    });
}

// Update sound icon
function updateSoundIcon() {
    if (soundIcon) {
        soundIcon.src = soundIsOn
            ? "images/soundon.png"
            : "images/soundoff.png";
    }

    if (soundToggle) {
        soundToggle.setAttribute(
            "aria-label",
            soundIsOn ? "Sound on" : "Sound off"
        );
    }
}
// Click sounds for buttons, links and dropdowns
document.addEventListener("click", (event) => {

    if (!(event.target instanceof Element)) return;

    const clickedElement = event.target.closest(
        "button, a, select, input[type='submit'], .message-card"
    );

    if (!clickedElement) return;

    // Sound toggle has its own handler
    if (clickedElement === soundToggle) return;

    // Send sound plays only after a successful save
    if (clickedElement.classList.contains("send-button")) return;

    playSound("click");
});

// Hover sounds on homepage buttons and birthday wishes
document.addEventListener("mouseover", (event) => {

    if (!(event.target instanceof Element)) return;

    const hoveredElement = event.target.closest(
        ".home-option, .message-card"
    );

    if (!hoveredElement) return;

    if (hoveredElement.contains(event.relatedTarget)) return;

    playSound("hover");
});

// Sound on/off button
if (soundToggle) {

    soundToggle.addEventListener("click", () => {

        if (soundIsOn) {
            playSound("click");
        }

        soundIsOn = !soundIsOn;

        localStorage.setItem(
            "birthdaySounds",
            soundIsOn ? "on" : "off"
        );

        updateSoundIcon();
    });
}

updateSoundIcon();
