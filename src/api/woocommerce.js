// src/api/woocommerce.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://cindyl23.sg-host.com/wp-json/wc/v3",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const getAuth = () => ({
  auth: {
    username: import.meta.env.VITE_APP_CONSUMER_KEY,
    password: import.meta.env.VITE_APP_CONSUMER_SECRET,
  },
});

export const fetchCategories = async () => {
  try {
    const response = await apiClient.get("/products/categories", getAuth());
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const toggleBookStatus = async (bookId, status) => {
  try {
    await apiClient.put(`/products/${bookId}`, { status }, getAuth());
  } catch (error) {
    console.error("Error toggling book status:", error);
    throw error;
  }
};

export const fetchPublishers = async () => {
  try {
    const response = await apiClient.get(
      "/products/attributes/4/terms",
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching publishers:", error);
    throw error;
  }
};
