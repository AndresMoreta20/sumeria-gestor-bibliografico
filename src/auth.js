import axios from "axios";

const API_URL = "https://cindyl23.sg-host.com/?rest_route=/simple-jwt-login/v1";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth`, {
      email,
      password,
    });

    const token = response.data.data.jwt; // Asegúrate de que este es el campo correcto para el token
    sessionStorage.setItem("user-token", token);

    console.log("Login response:", response); // Verificar la respuesta

    // Extraer el correo electrónico del objeto de respuesta
    const responseData = JSON.parse(response.config.data);
    const userEmail = responseData.email;

    sessionStorage.setItem("user-email", userEmail); // Almacenar el correo electrónico del usuario

    return { success: true, email: userEmail }; // Devolver solo el correo electrónico
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
  console.log("Logout function called");
  sessionStorage.removeItem("user-token");
  sessionStorage.removeItem("user-email"); // Eliminar el correo electrónico del usuario
  console.log("Token and user email removed from sessionStorage");
  window.location.href = "/login"; // Redirige al usuario a la página de inicio de sesión
};

export const isAuthenticated = () => {
  return !!sessionStorage.getItem("user-token");
};
