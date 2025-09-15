// Import Firebase core and database SDK
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDElMDzVnD_Rp_PMcIXeNAgwcIIezT9MVA",
    authDomain: "sample-cd27b.firebaseapp.com",
    databaseURL: "https://sample-cd27b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sample-cd27b",
    storageBucket: "sample-cd27b.firebasestorage.app",
    messagingSenderId: "509656108797",
    appId: "1:509656108797:web:4b87235a247a9a5d5cf894"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database instance
export const db = getDatabase(app);
