const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkYdFeT9HEmK_kghkaLOi0JwC5p0dN6mQ",
  authDomain: "events-platform-80427.firebaseapp.com",
  projectId: "events-platform-80427",
  storageBucket: "events-platform-80427.firebasestorage.app",
  messagingSenderId: "315579424991",
  appId: "1:315579424991:web:324999c04726eeccf5896a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

module.exports = { db, app, auth };