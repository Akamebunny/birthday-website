
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const birthdaySelect = document.getElementById("birthdaySelect");
const visitButton = document.getElementById("visitButton");
const status = document.getElementById("status");

// Prevent visiting before loading is finished
visitButton.disabled = true;

// Load birthday pages
async function loadBirthdays() {
    try {
        const birthdaysQuery = query(
            collection(db, "birthdays"),
            orderBy("name")
        );

        const snapshot = await getDocs(birthdaysQuery);

        snapshot.forEach((birthdayDoc) => {
            const birthday = birthdayDoc.data();

            // Ignore invalid records
            if (
                typeof birthday.name !== "string" ||
                !birthday.name.trim()
            ) {
                return;
            }

            const option = document.createElement("option");

            option.value = birthdayDoc.id;
            option.textContent = birthday.name;

            birthdaySelect.appendChild(option);
        });

        if (birthdaySelect.options.length <= 1) {
            status.textContent = "No birthday pages found yet.";
        } else {
            status.textContent = "";
            visitButton.disabled = false;
        }

    } catch (error) {
        console.error("Birthday loading error:", error);
        status.textContent = "Could not load birthday pages.";
    }
}

// Visit selected birthday page
visitButton.addEventListener("click", () => {
    const birthdayId = birthdaySelect.value;

    if (!birthdayId) {
        status.textContent = "Please choose a birthday person first.";
        return;
    }

    window.location.href =
        `birthday.html?id=${encodeURIComponent(birthdayId)}`;
});

loadBirthdays();
