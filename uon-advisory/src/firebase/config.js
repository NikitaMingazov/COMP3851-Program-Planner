// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACvK-EqHKzW2RV3H0Rc99TMi3GtnPH1-4",
  authDomain: "program-planner-1c4a6.firebaseapp.com",
  projectId: "program-planner-1c4a6",
  storageBucket: "program-planner-1c4a6.firebasestorage.app",
  messagingSenderId: "750345016109",
  appId: "1:750345016109:web:56956991b9eeda885e79a4",
  measurementId: "G-HGV2S4XC9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);