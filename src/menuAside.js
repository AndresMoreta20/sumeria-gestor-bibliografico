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
    to: "/requestsAdmin",
    label: "Solicitudes",
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
