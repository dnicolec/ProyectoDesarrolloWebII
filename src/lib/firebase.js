import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB1HG4V93CCbpURChPyF_9dYLZW8vNXdUk",
  authDomain: "superdeuper-dw2.firebaseapp.com",
  projectId: "superdeuper-dw2",
  storageBucket: "superdeuper-dw2.firebasestorage.app",
  messagingSenderId: "81734189463",
  appId: "1:81734189463:web:eae1d3a4b22875609944d2",
  measurementId: "G-59R7ZYVPN4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;