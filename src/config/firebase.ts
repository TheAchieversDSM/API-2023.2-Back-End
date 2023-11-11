import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: `${process.env.FIREBASE_KEY}`,
  authDomain: `${process.env.FIREBASE_AUTH}`,
  projectId: `${process.env.FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.FIREBASE_BUCKET}`,
  messagingSenderId: `${process.env.FIREBASE_MSGID}`,
  appId: `${process.env.FIREBASE_APPID}`,
  measurementId: `${process.env.FIREBASE_MEASUREMENTID}`
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);


