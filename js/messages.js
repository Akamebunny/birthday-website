
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


export async function saveWish(birthdayId, message, hint) {

    if (
        typeof birthdayId !== "string" ||
        typeof message !== "string" ||
        typeof hint !== "string"
    ) {
        throw new Error("Invalid birthday wish.");
    }

    const cleanMessage = message.trim();
    const cleanHint = hint.trim();

    if (
        !birthdayId.trim() ||
        !cleanMessage ||
        cleanMessage.length > 1000 ||
        cleanHint.length > 200
    ) {
        throw new Error("Invalid birthday wish.");
    }

    await addDoc(collection(db, "messages"), {
        birthdayId: birthdayId,
        message: cleanMessage,
        hint: cleanHint,
        createdAt: serverTimestamp()
    });
}
