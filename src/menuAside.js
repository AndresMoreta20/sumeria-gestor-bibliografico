import { mdiBook } from "@mdi/js";
import {
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
} from "@mdi/js";

export default [
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
    to: "/categories",
    label: "Autores",
    icon: mdiAccount,
  },
  {
    to: "/categories",
    label: "Editoriales",
    icon: mdiStore,
  },
  {
    to: "/categories",
    label: "Lenguajes",
    icon: mdiTranslate,
  },

  // {
  //   to: "/forms",
  //   label: "Forms",
  //   icon: mdiSquareEditOutline,
  // },
  // {
  //   to: "/ui",
  //   label: "UI",
  //   icon: mdiTelevisionGuide,
  // },
  // {
  //   to: "/responsive",
  //   label: "Responsive",
  //   icon: mdiResponsive,
  // },
  // {
  //   to: "/",
  //   label: "Styles",
  //   icon: mdiPalette,
  // /},
  // {
  //   to: "/profile",
  //   label: "Perfil",
  //   icon: mdiAccountCircle,
  // },
  // {
  //   to: "/login",
  //   label: "Login",
  //   icon: mdiLock,
  // },
  // {
  //   to: "/error",
  //   label: "Error",
  //   icon: mdiAlertCircle,
  // },
  // {
  //   label: "Dropdown",
  //   icon: mdiViewList,
  //   menu: [
  //     {
  //       label: "Item One",
  //     },
  //     {
  //       label: "Item Two",
  //     },
  //   ],
  // },
  // {
  //   href: "https://github.com/justboil/admin-one-vue-tailwind",
  //   label: "GitHub",
  //   icon: mdiGithub,
  //   target: "_blank",
  // },
  // {
  //   href: "https://github.com/justboil/admin-one-react-tailwind",
  //   label: "React version",
  //   icon: mdiReact,
  //   target: "_blank",
  // },
];
