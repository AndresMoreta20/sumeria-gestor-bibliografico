import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useMainStore } from "@/stores/main.js";

import "./css/main.css";

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");

const mainStore = useMainStore(pinia);

// Fetch sample data
mainStore.fetchSampleClients();
mainStore.fetchSampleHistory();

const defaultDocumentTitle = "Sumeria Gestor Bibliográfico";

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle;
});
