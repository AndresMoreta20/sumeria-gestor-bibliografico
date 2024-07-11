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

const userRole = sessionStorage.getItem("user-role");

export default [
  {
    isCurrentUser: true,
    menu: [
      ...(userRole === "publisher"
        ? [
            {
              icon: mdiKey,
              label: "Change Password",
              to: "/profile",
            },
          ]
        : []),
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
