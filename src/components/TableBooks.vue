<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
});

const categories = ref([]);
const selectedCategory = ref("all");
const selectedFormat = ref("all");
const loading = ref(false);

// Filtrar libros por categoría y formato
const filteredBooks = computed(() => {
  let booksByCategory = props.books;
  if (selectedCategory.value !== "all") {
    booksByCategory = props.books.filter((book) =>
      book.categories.some((category) => category.id === selectedCategory.value)
    );
  }

  if (selectedFormat.value === "all") {
    return booksByCategory;
  }

  if (selectedFormat.value === "physical") {
    return booksByCategory.filter((book) => !book.virtual);
  }

  if (selectedFormat.value === "digital") {
    return booksByCategory.filter((book) => book.virtual);
  }
  return booksByCategory;
});

// Navegar a la página de nuevo libro
const goToNewBook = () => {
  router.push({ name: "newBook" });
};

// Obtener categorías desde WooCommerce
const fetchCategories = async () => {
  const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
  const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;
  try {
    const response = await axios.get(
      "https://cindyl23.sg-host.com/wp-json/wc/v3/products/categories",
      {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      }
    );
    categories.value = response.data;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
  }
};

// Eliminar libro
const deleteBook = async (bookId) => {
  const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
  const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;
  try {
    if (confirm("¿Estás seguro de que quieres eliminar este libro?")) {
      loading.value = true;
      await axios.delete(
        `https://cindyl23.sg-host.com/wp-json/wc/v3/products/${bookId}`,
        {
          auth: {
            username: consumerKey,
            password: consumerSecret,
          },
        }
      );
      alert("Libro eliminado con éxito");
      loading.value = false;
      location.reload(); // Recargar la página después de la eliminación
    }
  } catch (error) {
    console.error("Error al eliminar el libro:", error.response?.data || error);
    alert("Error al eliminar el libro");
    loading.value = false;
  }
};

onMounted(fetchCategories);
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <label class="mr-2">Formato:</label>
      <select v-model="selectedFormat" class="border rounded p-2">
        <option value="all">Todos</option>
        <option value="physical">Físicos</option>
        <option value="digital">eBook</option>
      </select>
    </div>
    <div>
      <label class="mr-2">Categoría:</label>
      <select v-model="selectedCategory" class="border rounded p-2">
        <option value="all">Todas</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>
    <button @click="goToNewBook" class="bg-blue-500 text-white p-2 rounded">
      Nuevo Libro
    </button>
  </div>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative"
  >
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10"
    >
      <div
        class="border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-10 h-10 animate-spin"
      ></div>
    </div>
    <div
      v-for="book in filteredBooks"
      :key="book.id"
      class="bg-white rounded-lg shadow p-4 flex flex-col items-center h-full"
    >
      <img
        :src="book.images[0]?.src"
        alt="Book cover"
        class="h-48 w-32 object-cover mb-4"
      />
      <h2 class="text-lg font-semibold mb-2 text-center truncate w-full">
        {{ book.name }}
      </h2>
      <p class="text-blue-500 mb-2">${{ book.price }}</p>
      <p class="text-gray-500 mb-2">{{ book.categories[0]?.name }}</p>
      <p class="text-gray-500 mb-4">
        {{
          book.attributes.find((attr) => attr.name === "Formato")?.options[0]
        }}
      </p>
      <div class="mt-auto flex justify-between w-full">
        <button class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">
          Editar
        </button>
        <button
          @click="deleteBook(book.id)"
          class="bg-red-500 text-white py-2 px-4 rounded w-full"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
