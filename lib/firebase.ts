import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDG-5lPLZCTN4sPfSgCeRzSbvWmziDEcjU",
  authDomain: "wellfit-b7d27.firebaseapp.com",
  projectId: "wellfit-b7d27",
  storageBucket: "wellfit-b7d27.firebasestorage.app",
  messagingSenderId: "990165044511",
  appId: "1:990165044511:web:06e95751040f16079a742a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);