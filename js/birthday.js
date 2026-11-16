
import { db } from "./firebase.js";
import { playSound } from "./sounds.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { saveWish } from "./messages.js";

const params = new URLSearchParams(window.location.search);
const birthdayId = params.get("id");

const nameElement = document.getElementById("birthdayName");
const messagesElement = document.getElementById("messages");

const showMoreButton = document.getElementById("showMoreButton");
const showMoreText = document.getElementById("showMoreText");
const showMoreArrow = document.getElementById("showMoreArrow");

const messageForm = document.getElementById("messageForm");
const statusElement = document.getElementById("status");
const sendButton = messageForm.querySelector('button[type="submit"]');

let allMessages = [];
let isExpanded = false;


/* ==========================
   VALIDATE BIRTHDAY
========================== */

function isValidBirthday(birthday) {

    if (
        typeof birthday !== "string" ||
        !/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(birthday)
    ) {
        return false;
    }

    const [month, day] = birthday.split("-").map(Number);

    const testDate = new Date(2000, month - 1, day);

    return (
        testDate.getMonth() === month - 1 &&
        testDate.getDate() === day
    );
}


/* ==========================
   LOAD BIRTHDAY
========================== */

async function loadBirthday() {

    if (
        !birthdayId ||
        birthdayId.length > 100 ||
        birthdayId.includes("/")
    ) {
        window.location.replace("index.html");
        return;
    }

    try {

        const birthdayRef = doc(db, "birthdays", birthdayId);
        const birthdaySnap = await getDoc(birthdayRef);

        if (!birthdaySnap.exists()) {
            nameElement.textContent = "Birthday not found";
            return;
        }

        const birthday = birthdaySnap.data();

        if (
            typeof birthday.name !== "string" ||
            !birthday.name.trim() ||
            !isValidBirthday(birthday.birthday)
        ) {
            nameElement.textContent = "Invalid birthday information.";
            return;
        }

        nameElement.textContent =
            `Happy Birthday, ${birthday.name}!`;

        showCountdown(birthday.birthday);

        await loadMessages();

    } catch (error) {

        console.error("Birthday loading error:", error);

        nameElement.textContent = "Something went wrong.";
    }
}


/* ==========================
   COUNTDOWN
========================== */

function showCountdown(birthday) {

    const [month, day] = birthday.split("-").map(Number);

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    const todayMessage = document.getElementById("birthdayToday");
    const countdownGrid = document.querySelector(".countdown-grid");

    function updateCountdown() {

        const now = new Date();

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const isBirthdayToday =
            now.getMonth() === month - 1 &&
            now.getDate() === day;

        if (isBirthdayToday) {

            countdownGrid.hidden = true;
            todayMessage.hidden = false;

            return;
        }

        countdownGrid.hidden = false;
        todayMessage.hidden = true;

        let nextBirthday = new Date(
            now.getFullYear(),
            month - 1,
            day
        );

        if (nextBirthday < today) {

            nextBirthday = new Date(
                now.getFullYear() + 1,
                month - 1,
                day
            );
        }

        const difference = nextBirthday.getTime() - now.getTime();

        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );

        const hours = Math.floor(
            (difference / (1000 * 60 * 60)) % 24
        );

        const minutes = Math.floor(
            (difference / (1000 * 60)) % 60
        );

        const seconds = Math.floor(
            (difference / 1000) % 60
        );

        daysElement.textContent = String(days).padStart(2, "0");
        hoursElement.textContent = String(hours).padStart(2, "0");
        minutesElement.textContent = String(minutes).padStart(2, "0");
        secondsElement.textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();

    setInterval(updateCountdown, 1000);
}


/* ==========================
   LOAD WISHES FROM FIREBASE
========================== */

async function loadMessages() {

    messagesElement.textContent = "Loading wishes...";

    try {

        const messagesQuery = query(
            collection(db, "messages"),
            where("birthdayId", "==", birthdayId)
        );

        const snapshot = await getDocs(messagesQuery);

        allMessages = [];

        snapshot.forEach((messageDoc) => {

            const data = messageDoc.data();

            if (
                typeof data.message !== "string" ||
                !data.message.trim()
            ) {
                return;
            }

            allMessages.push({
                message: data.message,
                hint: typeof data.hint === "string" ? data.hint : "",
                createdAt: data.createdAt
            });
        });

        allMessages.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() ?? 0;
            const timeB = b.createdAt?.toMillis?.() ?? 0;

            return timeB - timeA;
        });

        renderMessages();

    } catch (error) {

        console.error("Wishes loading error:", error);

        messagesElement.textContent = "Could not load birthday wishes.";

        showMoreButton.hidden = true;
    }
}


/* ==========================
   DISPLAY WISH CARDS
========================== */

function renderMessages() {

    messagesElement.textContent = "";

    if (allMessages.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "No birthday wishes yet. Be the first! <3";

        messagesElement.appendChild(emptyMessage);

        showMoreButton.hidden = true;

        return;
    }

    const visibleMessages = isExpanded
        ? allMessages
        : allMessages.slice(0, 3);

    visibleMessages.forEach((data) => {

        const card = document.createElement("article");

        card.className = "message-card";

        const messageText = document.createElement("p");

        messageText.className = "message-text";
        messageText.textContent = data.message;

        card.appendChild(messageText);

        if (data.hint) {

            const hintText = document.createElement("p");

            hintText.className = "message-hint";
            hintText.textContent = `A little hint: ${data.hint}`;

            card.appendChild(hintText);
        }

        messagesElement.appendChild(card);
    });

    showMoreButton.hidden = allMessages.length <= 3;

    showMoreText.textContent = isExpanded
        ? "Show fewer wishes"
        : "Show more wishes";

    showMoreArrow.textContent = isExpanded ? "⌃" : "⌄";

    showMoreButton.setAttribute(
        "aria-expanded",
        String(isExpanded)
    );
}


/* ==========================
   EXPAND / COLLAPSE WISHES
========================== */

showMoreButton.addEventListener("click", () => {

    isExpanded = !isExpanded;

    renderMessages();
});


/* ==========================
   SEND A WISH
========================== */

messageForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const message = document.getElementById("message").value.trim();
    const hint = document.getElementById("hint").value.trim();

    if (!birthdayId) {

        statusElement.textContent = "Birthday page not found.";

        return;
    }

    if (!message || message.length > 1000 || hint.length > 200) {

        statusElement.textContent =
            "Please check your message and hint.";

        return;
    }

    try {

        sendButton.disabled = true;

        statusElement.textContent = "Sending your wish...";

        await saveWish(birthdayId, message, hint);

        playSound("send");

        messageForm.reset();

        statusElement.textContent =
            "Your birthday wish has been sent!";

        await loadMessages();

    } catch (error) {

        console.error("Message sending error:", error);

        statusElement.textContent =
            "Something went wrong. Please try again.";

    } finally {

        sendButton.disabled = false;
    }
});


/* ==========================
   START
========================== */

loadBirthday();
