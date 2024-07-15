import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useMainStore } from "@/stores/main.js";
import "./css/main.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const pinia = createPinia();
const app = createApp(App);
const mainStore = useMainStore(pinia);

let appInitialized = false;

const initializeApp = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userRole = sessionStorage.getItem("user-role");
    const userName = sessionStorage.getItem("user-name");
    const userEmail = sessionStorage.getItem("user-email");
    const userToken = sessionStorage.getItem("user-token");

    mainStore.setUser({
      name: userName,
      email: userEmail,
      token: userToken,
      role: userRole,
    });

    if (userRole === "publisher") {
      const docRef = doc(db, "publishers", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().needsPasswordChange) {
        router.push("/changePassword");
      }
    }
  } else {
    mainStore.resetUser();
  }

  if (!appInitialized) {
    app.use(router).use(pinia).mount("#app");
    appInitialized = true;
  }
};

// Fetch sample data if functions exist
if (typeof mainStore.fetchSampleClients === "function") {
  mainStore.fetchSampleClients();
}
if (typeof mainStore.fetchSampleHistory === "function") {
  mainStore.fetchSampleHistory();
}

const defaultDocumentTitle = "Sumeria Gestor Bibliográfico";

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle;
});

const auth = getAuth();

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!mainStore.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      const userRole = sessionStorage.getItem("user-role");
      if (userRole === "publisher") {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "publishers", user.uid);
          const docSnap = await getDoc(docRef);

          if (
            docSnap.exists() &&
            docSnap.data().needsPasswordChange &&
            to.path !== "/changePassword"
          ) {
            next("/changePassword");
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

onAuthStateChanged(auth, initializeApp);
