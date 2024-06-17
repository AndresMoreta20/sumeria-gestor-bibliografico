import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useMainStore } from "@/stores/main.js";

const API_URL = "https://cindyl23.sg-host.com/?rest_route=/simple-jwt-login/v1";

export const login = async (email, password) => {
  const mainStore = useMainStore();

  try {
    // Try Firebase Authentication first
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Firebase authentication successful
      mainStore.setUser({ email: user.email, role: "publisher" });
      return { success: true, email: user.email, isFirebase: true };
    } catch (firebaseError) {
      console.error("Firebase login failed:", firebaseError);
    }

    // If Firebase login fails, try Simple JWT
    const response = await axios.post(`${API_URL}/auth`, {
      email,
      password,
    });

    const token = response.data.data.jwt;
    mainStore.setUser({ email, token, role: "admin" });

    return { success: true, email, token, isFirebase: false };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const getUserInfo = async () => {
  try {
    const token = sessionStorage.getItem("user-token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get user info error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch user info"
    );
  }
};

export const logout = () => {
  const mainStore = useMainStore();
  mainStore.resetUser();
  window.location.href = "/login";
};

export const isAuthenticated = () => {
  const mainStore = useMainStore();
  return !!mainStore.userToken || !!auth.currentUser;
};
