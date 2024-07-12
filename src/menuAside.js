// src/menuAside.js
import {
  mdiBook,
  mdiSpeedometer,
  mdiBookOpen,
  mdiHeart,
  mdiAccount,
  mdiStore,
  mdiTranslate,
  mdiPencilMinus,
} from "@mdi/js";
import { useMainStore } from "@/stores/main";
import { computed } from "vue";

const mainStore = useMainStore();

const adminMenu = [
  {
    header: "Administrador",
  },
  {
    to: "/dashboard",
    icon: mdiSpeedometer,
    label: "Dashboard",
  },
  {
    to: "/books",
    label: "Libros",
    icon: mdiBookOpen,
  },
  {
    to: "/categories",
    label: "Categorias",
    icon: mdiHeart,
  },
  {
    to: "/authors",
    label: "Autores",
    icon: mdiAccount,
  },
  {
    to: "/publishers",
    label: "Editoriales",
    icon: mdiStore,
  },
  {
    to: "/languages",
    label: "Lenguajes",
    icon: mdiTranslate,
  },
  {
    header: "Solicitudes",
  },
  {
    to: "/requestsAdmin",
    label: "Libros",
    icon: mdiPencilMinus,
  },
  {
    to: "/publisher-requests",
    label: "Editoriales",
    icon: mdiPencilMinus,
  },
];

const publisherMenu = [
  {
    header: "Generales",
  },
  {
    to: "/books",
    label: "Catálogo sumeria",
    icon: mdiBookOpen,
  },
  {
    header: "Mi espacio",
  },
  {
    to: "/requests",
    label: "Solicitudes",
    icon: mdiPencilMinus,
  },
  {
    to: "/publisherBooksView",
    label: "Mis libros",
    icon: mdiBookOpen,
  },
];

const menu = computed(() => {
  console.log("Determining menu based on user role:", mainStore.userRole);
  return mainStore.userRole === "admin" ? adminMenu : publisherMenu;
});

export default menu;
