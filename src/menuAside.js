import {
  mdiBook,
  mdiAccountCircle,
  mdiMonitor,
  mdiGithub,
  mdiLock,
  mdiAlertCircle,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
  mdiTelevisionGuide,
  mdiResponsive,
  mdiPalette,
  mdiReact,
  mdiSpeedometer,
  mdiBookOpen,
  mdiHeart,
  mdiAccount,
  mdiStore,
  mdiTranslate,
  mdiPencilMinus,
} from "@mdi/js";
import { useMainStore } from "@/stores/main.js";

const mainStore = useMainStore();
const userRole = mainStore.userRole;

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
    to: "/requests",
    label: "Solicitudes",
    icon: mdiPencilMinus,
  },
];

export default userRole === "admin" ? adminMenu : publisherMenu;
