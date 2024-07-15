// src/utils/authGuard.js
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import router from "@/router";

export async function authGuard(to, from, next) {
  const auth = getAuth();
  const user = auth.currentUser;
  const userRole = sessionStorage.getItem("user-role");

  if (!user) {
    router.push({ name: "login" });
    return;
  }

  if (userRole === "publisher") {
    const docRef = doc(db, "publishers", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().needsPasswordChange) {
      if (to.name !== "changePassword") {
        router.push({ name: "changePassword" });
        return;
      }
    }
  }

  next();
}
