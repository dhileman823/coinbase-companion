// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBL1wK9eSeszTyNsxYn3M1AK7HP2yXeAkY",
  authDomain: "coinbase-companion.firebaseapp.com",
  projectId: "coinbase-companion",
  storageBucket: "coinbase-companion.appspot.com",
  messagingSenderId: "748167419827",
  appId: "1:748167419827:web:6fdaf3df7f63604283ddc6",
  measurementId: "G-04JNZKYQZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt: "select_account"});