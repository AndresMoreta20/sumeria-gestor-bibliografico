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

// Functions for categories
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

// En woocommerce.js
export const createCategory = async (name) => {
  console.log("createCategory called with name:", name);
  try {
    const response = await apiClient.post(
      "/products/categories",
      { name },
      getAuth()
    );
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
};

export const updateCategory = async (id, updatedData) => {
  try {
    const response = await apiClient.put(
      `/products/categories/${id}`,
      updatedData,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID (${id}):`, error);
    throw error;
  }
};

// Functions for publishers
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

// Functions for books
export const fetchBooks = async () => {
  try {
    const data = await fetchAllPages("/products");
    return data;
  } catch (error) {
    console.error("Error fetching books:", error);
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

export const toggleBookStatus = async (bookId, status) => {
  try {
    await apiClient.put(`/products/${bookId}`, { status }, getAuth());
  } catch (error) {
    console.error(`Error toggling book status for book ID (${bookId}):`, error);
    throw error;
  }
};

export const uploadProduct = async (data) => {
  try {
    const response = await apiClient.post("/products", data, getAuth());
    return response.data;
  } catch (error) {
    console.error("Error uploading product to WooCommerce:", error);
    throw error;
  }
};

export const updateProductById = async (productId, updatedData) => {
  try {
    const response = await apiClient.put(
      `/products/${productId}`,
      updatedData,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID (${productId}):`, error);
    throw error;
  }
};

export const fetchTrashedProducts = async () => {
  try {
    const data = await fetchAllPages("/products", { status: "trash" });
    return data;
  } catch (error) {
    console.error("Error fetching trashed products:", error);
    throw error;
  }
};

export const restoreProduct = async (productId) => {
  try {
    const response = await apiClient.put(
      `/products/${productId}`,
      { status: "publish" },
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error restoring product with ID (${productId}):`, error);
    throw error;
  }
};

// Functions for customers
export const fetchCustomersData = async () => {
  try {
    const data = await fetchAllPages("/customers");
    return data;
  } catch (error) {
    console.error("Error fetching customers data:", error);
    throw error;
  }
};

// Functions for authors
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

export const updateAuthor = async (authorId, updatedData) => {
  try {
    const response = await apiClient.put(
      `/products/attributes/1/terms/${authorId}`,
      updatedData,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating author with ID (${authorId}):`, error);
    throw error;
  }
};

// Functions for languages
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

export const updateLanguage = async (languageId, updatedData) => {
  try {
    const response = await apiClient.put(
      `/products/attributes/7/terms/${languageId}`,
      updatedData,
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating language with ID (${languageId}):`, error);
    throw error;
  }
};

// Other utility functions
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

export const fetchCategoryByName = async (name) => {
  try {
    const response = await apiClient.get("/products/categories", {
      params: { search: name },
      ...getAuth(),
    });
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Error fetching category by name:", error);
    throw error;
  }
};

export const createAuthor = async (name) => {
  try {
    const response = await apiClient.post(
      "/products/attributes/1/terms",
      { name },
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating author:", error);
    throw error;
  }
};

// export const createCategory = async (name) => {
//   try {
//     const response = await apiClient.post(
//       "/products/categories",
//       { name },
//       getAuth()
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error creating category:", error);
//     throw error;
//   }
// };

export const createLanguage = async (name) => {
  try {
    const response = await apiClient.post(
      "/products/attributes/7/terms",
      { name },
      getAuth()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating language:", error);
    throw error;
  }
};
