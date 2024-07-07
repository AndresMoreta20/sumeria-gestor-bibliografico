// woocommerce.js
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

const fetchAllPages = async (endpoint, params = {}) => {
  let page = 1;
  let allData = [];
  let hasMore = true;

  while (hasMore) {
    const response = await apiClient.get(endpoint, {
      ...getAuth(),
      params: { ...params, page, per_page: 100 },
    });
    allData = [...allData, ...response.data];
    hasMore = response.headers["x-wp-totalpages"] > page;
    page++;
  }

  return allData;
};

export const fetchCategories = async () => {
  try {
    const data = await fetchAllPages("/products/categories");
    return { data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  if (isNaN(id)) {
    console.log(`ID no es un número: ${id}`);
    return { name: id };
  }
  try {
    const response = await apiClient.get(
      `/products/categories/${id}`,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching category by ID (${id}):`, error);
    throw error;
  }
};

export const fetchPublishers = async () => {
  try {
    const data = await fetchAllPages("/products/attributes/4/terms");
    return data;
  } catch (error) {
    console.error("Error fetching publishers:", error);
    throw error;
  }
};

export const fetchPublisherById = async (id) => {
  if (isNaN(id)) {
    console.log(`ID no es un número: ${id}`);
    return { name: id };
  }
  try {
    const response = await apiClient.get(
      `/products/attributes/4/terms/${id}`,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching publisher by ID (${id}):`, error);
    throw error;
  }
};

export const fetchBooks = async () => {
  try {
    const data = await fetchAllPages("/products");
    return data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const fetchCustomersData = async () => {
  try {
    const data = await fetchAllPages("/customers");
    return data;
  } catch (error) {
    console.error("Error fetching customers data:", error);
    throw error;
  }
};

export const toggleBookStatus = async (bookId, status) => {
  try {
    await apiClient.put(`/products/${bookId}`, { status }, getAuth());
  } catch (error) {
    console.error(`Error toggling book status for book ID (${bookId}):`, error);
    throw error;
  }
};

export const fetchBookDetails = async (bookId) => {
  try {
    const response = await apiClient.get(`/products/${bookId}`, getAuth());
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching book details for book ID (${bookId}):`,
      error
    );
    throw error;
  }
};

export const fetchSalesData = async () => {
  try {
    const response = await apiClient.get(
      "/reports/sales?period=week",
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
};

export const fetchAuthors = async () => {
  try {
    const data = await fetchAllPages("/products/attributes/1/terms");
    return { data };
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw error;
  }
};

export const fetchAuthorById = async (id) => {
  if (isNaN(id)) {
    console.log(`ID no es un número: ${id}`);
    return { name: id };
  }
  try {
    const response = await apiClient.get(
      `/products/attributes/1/terms/${id}`,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching author by ID (${id}):`, error);
    throw error;
  }
};

export const fetchLanguages = async () => {
  try {
    const data = await fetchAllPages("/products/attributes/7/terms");
    return { data };
  } catch (error) {
    console.error("Error fetching languages:", error);
    throw error;
  }
};

export const fetchLanguageById = async (id) => {
  if (isNaN(id)) {
    console.log(`ID no es un número: ${id}`);
    return { name: id };
  }
  try {
    const response = await apiClient.get(
      `/products/attributes/7/terms/${id}`,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching language by ID (${id}):`, error);
    throw error;
  }
};

export const uploadProduct = async (data) => {
  try {
    const response = await apiClient.post("/products", data, {
      auth: getAuth().auth,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading product to WooCommerce:", error);
    throw error;
  }
};

export const checkSkuExists = async (sku) => {
  try {
    const response = await apiClient.get("/products", {
      ...getAuth(),
      params: { sku },
    });
    return response.data.length > 0;
  } catch (error) {
    console.error("Error checking SKU:", error);
    throw error;
  }
};
