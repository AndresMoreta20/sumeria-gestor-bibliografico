import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login } from "@/services/auth.js";

export const useMainStore = defineStore("main", () => {
  const userName = ref("admin");
  const userEmail = ref("");
  const userToken = ref(sessionStorage.getItem("user-token") || "");
  const userRole = ref(sessionStorage.getItem("user-role") || "");

  const userAvatar = computed(() => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail.value.replace(
      /[^a-z0-9]+/gi,
      "-"
    )}`;
  });

  const isFieldFocusRegistered = ref(false);
  const clients = ref([]);
  const history = ref([]);

  function setUser(payload) {
    if (payload.name) {
      userName.value = payload.name;
    }
    if (payload.email) {
      userEmail.value = payload.email;
    }
    if (payload.token) {
      userToken.value = payload.token;
      sessionStorage.setItem("user-token", payload.token);
    }
    if (payload.role) {
      userRole.value = payload.role;
      sessionStorage.setItem("user-role", payload.role);
      // Set the userName based on the role
      userName.value = payload.role === "publisher" ? "editorial" : "admin";
    }
  }

  function resetUser() {
    userName.value = "";
    userEmail.value = "";
    userToken.value = "";
    userRole.value = "";
    sessionStorage.removeItem("user-token");
    sessionStorage.removeItem("user-role");
  }

  async function handleLogin(email, password) {
    try {
      const response = await login(email, password);
      if (response.success) {
        const role = response.isFirebase ? "publisher" : "admin";
        setUser({ email: response.email, token: response.token, role });
        console.log("User email set in store:", response.email);
      } else {
        console.error("Credenciales incorrectas:", response.message);
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  return {
    userName,
    userEmail,
    userToken,
    userRole,
    userAvatar,
    isFieldFocusRegistered,
    clients,
    history,
    setUser,
    resetUser,
    handleLogin,
  };
});
