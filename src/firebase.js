
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
const firebaseConfig = {
    apiKey: "AIzaSyC022yM2ya5ZUZy8Nwil0WKdxi1XuxxZnw",
    authDomain: "mega-sena-e9992.firebaseapp.com",
    projectId: "mega-sena-e9992",
    storageBucket: "mega-sena-e9992.appspot.com",
    messagingSenderId: "710641321890",
    appId: "1:710641321890:web:db9426daebcdf25778d4fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db }