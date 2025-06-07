// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRC7DBAz6WERd1h04keHjNE-TIy6ZLa2Y",
  authDomain: "irwan-d857b.firebaseapp.com",
  projectId: "irwan-d857b",
  storageBucket: "irwan-d857b.firebasestorage.app",
  messagingSenderId: "707551622952",
  appId: "1:707551622952:web:86e78679fb944df10c821d",
  measurementId: "G-GFY9HDMJ1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);