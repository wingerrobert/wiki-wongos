import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEHsFKS1KF04mfkKTPT62LKrEhFLJR7ug",
  authDomain: "wiki-wongos.firebaseapp.com",
  projectId: "wiki-wongos",
  storageBucket: "wiki-wongos.firebasestorage.app",
  messagingSenderId: "464561200945",
  appId: "1:464561200945:web:30356383f75d92167d5a10",
  measurementId: "G-K8PH8YS3NR"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

const db = getFirestore(app);

export { db };
