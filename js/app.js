
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const form = document.getElementById("birthdayForm");
const status = document.getElementById("status");

// The button is outside the form
const submitButton = document.querySelector(
    'button[form="birthdayForm"]'
);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const birthday = document.getElementById("birthday").value;

    if (!name || name.length > 60) {
        status.textContent = "Name must be between 1 and 60 characters.";
        return;
    }

    if (!birthday) {
        status.textContent = "Please select a birthday.";
        return;
    }

    const dateParts = birthday.split("-").map(Number);

    if (dateParts.length !== 3) {
        status.textContent = "Please enter a valid birthday.";
        return;
    }

    const [year, month, day] = dateParts;
    const selectedDate = new Date(year, month - 1, day);

    if (
        selectedDate.getFullYear() !== year ||
        selectedDate.getMonth() !== month - 1 ||
        selectedDate.getDate() !== day
    ) {
        status.textContent = "Please enter a valid birthday.";
        return;
    }

    try {
        status.textContent = "Saving...";

        if (submitButton) {
            submitButton.disabled = true;
        }

        await addDoc(collection(db, "birthdays"), {
            name: name,
            birthday: birthday.substring(5),
            createdAt: serverTimestamp()
        });

        status.textContent = "Birthday saved successfully! 🎂";
        form.reset();

    } catch (error) {
        console.error("Birthday save error:", error);
        status.textContent = "Something went wrong. Please try again.";

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});
