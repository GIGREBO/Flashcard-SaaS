import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyBUdCgrRS4pc0s3MV1lLddA8P2xXZfj4tc",
    authDomain: "project4-6a0a8.firebaseapp.com",
    projectId: "project4-6a0a8",
    storageBucket: "project4-6a0a8.firebasestorage.app",
    messagingSenderId: "601342109645",
    appId: "1:601342109645:web:a2bcb9109bcd0b98a90684"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;

