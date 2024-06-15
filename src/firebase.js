import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAb3CnEKetsmswQtKn-J108PHrv7Ve-vlQ",
  authDomain: "sumeria-editoriales-f0071.firebaseapp.com",
  projectId: "sumeria-editoriales-f0071",
  storageBucket: "sumeria-editoriales-f0071.appspot.com",
  messagingSenderId: "362080536073",
  appId: "1:362080536073:web:c4aa49e9e27fcd6c375ad8",
  measurementId: "G-WKP7C9HGBY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
