import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  projectId: "gen-lang-client-0450733054",
  appId: "1:122728804825:web:9cea13695f055b33f969c8",
  apiKey: "AIzaSyDHp3mxdFXCcc7vv_2l9VH0YqdD2Onv64E",
  authDomain: "gen-lang-client-0450733054.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-cinestream-a16cffb1-52ac-4dd4-a6e6-5d0ec7e05c34",
  storageBucket: "gen-lang-client-0450733054.firebasestorage.app",
  messagingSenderId: "122728804825",
  measurementId: "",
  oAuthClientId: "122728804825-e4otq40mvtra73vlavj5aqenftiqr68k.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const auth = getAuth(app);

