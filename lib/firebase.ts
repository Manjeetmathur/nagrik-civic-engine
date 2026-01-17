import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// These should be set in your .env file
const firebaseConfig = {
    apiKey: "AIzaSyAXWOIUQHR35vqn-A1dyOj86x6jbd98UqE",
    authDomain: "alert-2f17d.firebaseapp.com",
    databaseURL: "https://alert-2f17d-default-rtdb.firebaseio.com",
    projectId: "alert-2f17d",
    storageBucket: "alert-2f17d.firebasestorage.app",
    messagingSenderId: "537202718193",
    appId: "1:537202718193:web:8f906c53e7da65ed2b8050",
    measurementId: "G-R3QX238435"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const firestore = getFirestore(app);

export { app, db, firestore };
