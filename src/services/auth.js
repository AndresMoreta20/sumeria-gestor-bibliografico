import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
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

      // Obtener el documento del usuario para obtener el nombre
      const userDoc = await getDoc(doc(db, "publishers", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User document does not exist");
      }
      const userName = userDoc.data().razonSocial || "Unnamed";

      // Firebase authentication successful
      mainStore.setUser({
        name: userName,
        email: user.email,
        token: user.uid, // Use the UID as the token
        role: "publisher",
      });

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
    const userName = "admin";

    mainStore.setUser({ name: userName, email, token, role: "admin" });

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
};

export const isAuthenticated = () => {
  const mainStore = useMainStore();
  return mainStore.isAuthenticated;
};
