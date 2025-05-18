// import { initializeApp, getApps } from 'firebase/app';  
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';  
// import { getDatabase, ref, set, push } from 'firebase/database';  
// import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';  
// import { getStorage } from "firebase/storage";
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyAXAaPMjmyNSVO06G-scb8V88Mhiu_Jwpo",
//   authDomain: "lelangin-e4ceb.firebaseapp.com",
//   projectId: "lelangin-e4ceb",
//   storageBucket: "lelangin-e4ceb.appspot.com", 
//   messagingSenderId: "2184481177",
//   databaseURL: "https://lelangin-e4ceb-default-rtdb.firebaseio.com", 
//   appId: "1:2184481177:web:b8a6e3a46e8255d2ecab08"
// };

// const apps = getApps();
// const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];  

// const db = getFirestore(app);
// const realtimeDb = getDatabase(app);
// const storage = getStorage(app);

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

// const addArtikel = async (artikelData) => {
//   const artikelRef = ref(realtimeDb, 'artikell'); 
//   const newArtikelRef = push(artikelRef);
//   await set(newArtikelRef, artikelData);
// };

// export { db, collection, addDoc, serverTimestamp, auth, ref, set, push, realtimeDb, storage, addArtikel };


import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set, push } from 'firebase/database';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAXAaPMjmyNSVO06G-scb8V88Mhiu_Jwpo",
  authDomain: "lelangin-e4ceb.firebaseapp.com",
  projectId: "lelangin-e4ceb",
  storageBucket: "lelangin-e4ceb.appspot.com",
  messagingSenderId: "2184481177",
  databaseURL: "https://lelangin-e4ceb-default-rtdb.firebaseio.com",
  appId: "1:2184481177:web:b8a6e3a46e8255d2ecab08"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  auth = getAuth(app);
}

const addArtikel = async (artikelData) => {
  const artikelRef = ref(realtimeDb, 'artikel');
  const newArtikelRef = push(artikelRef);
  await set(newArtikelRef, artikelData);
};

export { db, collection, addDoc, serverTimestamp, auth, ref, set, push, realtimeDb, storage, addArtikel };
