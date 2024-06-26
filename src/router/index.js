import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { isAuthenticated } from "@/services/auth.js";

const router = createRouter({
  history: createWebHistory(), // Cambiado de createWebHashHistory a createWebHistory
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
