// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration - PASTED FROM YOUR CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyAE3QwD4azgymmpSq1mfkA3qtLFr9bSjf4",
  authDomain: "personafy-b0bce.firebaseapp.com",
  projectId: "personafy-b0bce",
  storageBucket: "personafy-b0bce.appspot.com",
  messagingSenderId: "131536442852",
  appId: "1:131536442852:web:8bc2843d9244e80f0ba3f1",
  measurementId: "G-G30PYNXZX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services that we will use
export const auth = getAuth(app);
export const db = getFirestore(app);
