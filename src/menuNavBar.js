import {
  mdiMenu,
  mdiClockOutline,
  mdiCloud,
  mdiCrop,
  mdiAccount,
  mdiCogOutline,
  mdiEmail,
  mdiLogout,
  mdiThemeLightDark,
  mdiGithub,
  mdiReact,
  mdiKey,
} from "@mdi/js";
import { logout } from "@/services/auth.js";

export default [
  {
    isCurrentUser: true,
    menu: [
      {
        icon: mdiKey,
        label: "Change Password",
        to: "/profile",
      },
      {
        icon: mdiLogout,
        label: "Logout",
        to: "/",
        isLogout: true,
        onClick: logout,
      },
    ],
  },
  {
    icon: mdiThemeLightDark,
    label: "Light/Dark",
    isDesktopNoLabel: true,
    isToggleLightDark: true,
  },
];
