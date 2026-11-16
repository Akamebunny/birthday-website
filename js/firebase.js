
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQuOHCvr8OMnYxfc4KaT1hW-bf6kqYUn8",
  authDomain: "birthday-62b58.firebaseapp.com",
  projectId: "birthday-62b58",
  storageBucket: "birthday-62b58.firebasestorage.app",
  messagingSenderId: "351244111626",
  appId: "1:351244111626:web:977a5a3a5d8770d0ddb4f3"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
