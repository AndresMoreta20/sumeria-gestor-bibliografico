// src/stores/main.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { login } from "@/services/auth.js";

export const useMainStore = defineStore("main", () => {
  const userName = ref(sessionStorage.getItem("user-name") || "");
  const userEmail = ref(sessionStorage.getItem("user-email") || "");
  const userToken = ref(sessionStorage.getItem("user-token") || "");
  const userRole = ref(sessionStorage.getItem("user-role") || "");
  const isAuthenticated = ref(!!sessionStorage.getItem("user-token"));

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
      sessionStorage.setItem("user-name", payload.name);
    }
    if (payload.email) {
      userEmail.value = payload.email;
      sessionStorage.setItem("user-email", payload.email);
    }
    if (payload.token) {
      userToken.value = payload.token;
      sessionStorage.setItem("user-token", payload.token);
    }
    if (payload.role) {
      userRole.value = payload.role;
      sessionStorage.setItem("user-role", payload.role);
    }
    isAuthenticated.value = true;
  }

  function resetUser() {
    userName.value = "";
    userEmail.value = "";
    userToken.value = "";
    userRole.value = "";
    isAuthenticated.value = false;
    sessionStorage.clear();
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

  async function fetchSampleClients() {
    // Sample fetch implementation
    console.log("fetch clients");
  }

  async function fetchSampleHistory() {
    // Sample fetch implementation
    console.log("fetch history");
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
    isAuthenticated,
    fetchSampleClients,
    fetchSampleHistory,
  };
});
