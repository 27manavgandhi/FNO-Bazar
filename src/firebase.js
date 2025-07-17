// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5weW8-a8lTxpSmZsFyBvdCBCFpCiFtlw",
  authDomain: "fno-bazar.firebaseapp.com",
  databaseURL: "https://fno-bazar-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fno-bazar",
  storageBucket: "fno-bazar.appspot.com",
  messagingSenderId: "935090271339",
  appId: "1:935090271339:web:d2b33a9e390486c651ad2e",
  measurementId: "G-8DPGFEPC1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const futureDB=getDatabase(app)
export { app,auth,db,futureDB }