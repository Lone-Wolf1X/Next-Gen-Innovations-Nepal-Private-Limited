import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAfZ3oSHIkXytaHRsT0VInYm8weQUz2lkM",
  authDomain: "nextgen-learn-2c351.firebaseapp.com",
  projectId: "nextgen-learn-2c351",
  storageBucket: "nextgen-learn-2c351.firebasestorage.app",
  messagingSenderId: "917024364153",
  appId: "1:917024364153:web:c970eae3617ff181a466a8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
