import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSUmy7ijOdu75geXU1-2jvxhDmkvO7B6I",
  authDomain: "calorie-tracking-app-af743.firebaseapp.com",
  projectId: "calorie-tracking-app-af743",
  storageBucket: "calorie-tracking-app-af743.firebasestorage.app",
  messagingSenderId: "304954454042",
  appId: "1:304954454042:web:8d1d0ffb4a3c982b4fe1a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
