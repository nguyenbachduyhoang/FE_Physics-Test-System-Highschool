import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpdoGRmNpyOu2SLDwLkWTMZH8fmjxDRQE",
  authDomain: "thienbao122004-1be46.firebaseapp.com",
  projectId: "thienbao122004-1be46",
  storageBucket: "thienbao122004-1be46.firebasestorage.app",
  messagingSenderId: "952842872836",
  appId: "1:952842872836:web:0a9b9505fe4cb39faced51",
  measurementId: "G-51JE6TRC1T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
  hd: '*' // Allow any domain
});

const db = getFirestore(app);

export { auth, provider, db, app };