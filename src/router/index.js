import { createRouter, createWebHashHistory } from "vue-router";
import { isAuthenticated } from "../auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    meta: {
      title: "Login",
    },
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    meta: {
      title: "Dashboard",
      requiresAuth: true,
    },
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    meta: {
      title: "Libros",
      requiresAuth: true,
    },
    path: "/books",
    name: "books",
    component: () => import("@/views/BooksView.vue"),
  },
  {
    meta: {
      title: "Categorias",
      requiresAuth: true,
    },
    path: "/categories",
    name: "categories",
    component: () => import("@/views/CategoriesView.vue"),
  },
  {
    meta: {
      title: "Autores",
      requiresAuth: true,
    },
    path: "/authors",
    name: "authors",
    component: () => import("@/views/AuthorView.vue"),
  },
  {
    meta: {
      title: "Editoriales",
      requiresAuth: true,
    },
    path: "/publishers",
    name: "publishers",
    component: () => import("@/views/PublishersView.vue"),
  },
  {
    meta: {
      title: "Lenguajes",
      requiresAuth: true,
    },
    path: "/languages",
    name: "languages",
    component: () => import("@/views/LanguagesView.vue"),
  },
  {
    meta: {
      title: "Solicitudes",
      requiresAuth: true,
    },
    path: "/requests",
    name: "requests",
    component: () => import("@/views/RequestsView.vue"),
  },
  {
    meta: {
      title: "Solicitudes pendientes",
      requiresAuth: true,
    },
    path: "/requestsAdmin",
    name: "requestsAdmin",
    component: () => import("@/views/AdminRequestView.vue"),
  },
  {
    meta: {
      title: "Forms",
      requiresAuth: true,
    },
    path: "/forms",
    name: "forms",
    component: () => import("@/views/FormsView.vue"),
  },
  {
    meta: {
      title: "Nuevo Autor",
      requiresAuth: true,
    },
    path: "/authorForm",
    name: "authorForm",
    component: () => import("@/views/AuthorForm.vue"),
  },
  {
    meta: {
      title: "Nuevo Lenguaje",
      requiresAuth: true,
    },
    path: "/languageForm",
    name: "languageForm",
    component: () => import("@/views/LanguageForm.vue"),
  },
  {
    meta: {
      title: "Nueva Editorial",
      requiresAuth: true,
    },
    path: "/publisherForm",
    name: "publisherForm",
    component: () => import("@/views/PublisherForm.vue"),
  },
  {
    meta: {
      title: "Nueva Categoria",
      requiresAuth: true,
    },
    path: "/categoryForm",
    name: "categoryForm",
    component: () => import("@/views/CategoryForm.vue"),
  },
  {
    meta: {
      title: "Nueva Solicitud",
      requiresAuth: true,
    },
    path: "/requestForm",
    name: "requestForm",
    component: () => import("@/views/RequestForm.vue"),
  },
  {
    meta: {
      title: "Nuevo Libro",
      requiresAuth: true,
    },
    path: "/newBook",
    name: "newBook",
    component: () => import("@/views/BookForm.vue"),
  },
  {
    meta: {
      title: "Profile",
      requiresAuth: true,
    },
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
  },
  {
    meta: {
      title: "Ui",
      requiresAuth: true,
    },
    path: "/ui",
    name: "ui",
    component: () => import("@/views/UiView.vue"),
  },
  {
    meta: {
      title: "Responsive layout",
      requiresAuth: true,
    },
    path: "/responsive",
    name: "responsive",
    component: () => import("@/views/ResponsiveView.vue"),
  },
  {
    meta: {
      title: "Error",
    },
    path: "/error",
    name: "error",
    component: () => import("@/views/ErrorView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
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
