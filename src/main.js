import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useMainStore } from "@/stores/main.js";
import "./css/main.css";

const pinia = createPinia();
const app = createApp(App);

app.use(router).use(pinia).mount("#app");

const mainStore = useMainStore(pinia);

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

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!mainStore.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});
