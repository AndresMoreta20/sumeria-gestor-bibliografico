import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { isAuthenticated } from "@/services/auth.js";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next({ name: "login" });
    } else {
      const userRole = sessionStorage.getItem("user-role");
      if (userRole === "publisher") {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "publishers", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().needsPasswordChange) {
            if (to.name === "changePassword") {
              next();
            } else {
              next({ name: "changePassword" });
            }
          } else {
            next();
          }
        } else {
          next();
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
