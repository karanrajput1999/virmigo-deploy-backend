const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");

// app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAb2CGZzvcy7q75Q9jJumnCguVpAeiBIl0",
  authDomain: "virmigo-baed9.firebaseapp.com",
  projectId: "virmigo-baed9",
  storageBucket: "virmigo-baed9.appspot.com",
  messagingSenderId: "563531296276",
  appId: "1:563531296276:web:e2a2db98143ebfd61e4101",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = { storage, ref, getDownloadURL, uploadBytesResumable };
