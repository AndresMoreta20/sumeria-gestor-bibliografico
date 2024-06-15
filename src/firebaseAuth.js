// firebaseAuth.js
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const firebaseLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const checkFirebaseUser = async (email) => {
  try {
    const user = await getAuth().getUserByEmail(email);
    return user !== null;
  } catch (error) {
    return false; // User not found
  }
};
