<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import FormCheckRadio from "@/components/FormCheckRadio.vue"; // Asegúrate de importar tu componente correctamente

const router = useRouter();

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-book']); // Definir la emisión del evento

const categories = ref([]);
const selectedCategory = ref("all");
const selectedFormat = ref("all");
const showAvailable = ref(true); // Nuevo estado para mostrar disponibles o no disponibles
const loading = ref(false);

// Filtrar libros por categoría, formato y disponibilidad
const filteredBooks = computed(() => {
  let booksByCategory = props.books;
  if (selectedCategory.value !== "all") {
    booksByCategory = props.books.filter((book) =>
      book.categories.some((category) => category.id === selectedCategory.value)
    );
  }

  if (selectedFormat.value !== "all") {
    booksByCategory = booksByCategory.filter((book) =>
      selectedFormat.value === "physical" ? !book.virtual : book.virtual
    );
  }

  return booksByCategory.filter(book => book.status === (showAvailable.value ? "publish" : "private"));
});

// Navegar a la página de nuevo libro
const goToNewBook = () => {
  router.push({ name: "newBook" });
};

// Navegar a la vista de detalles del libro
const viewBook = (bookId) => {
  emit('view-book', bookId); // Emitir el evento con el ID del libro
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

// Cambiar estado del libro a 'private' o 'publish'
const toggleBookStatus = async (bookId, status) => {
  const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
  const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;
  try {
    if (confirm(`¿Estás seguro de que quieres ${status === 'private' ? 'desactivar' : 'activar'} este libro?`)) {
      loading.value = true;
      await axios.put(
        `https://cindyl23.sg-host.com/wp-json/wc/v3/products/${bookId}`,
        { status },
        {
          auth: {
            username: consumerKey,
            password: consumerSecret,
          },
        }
      );
      alert(`Libro ${status === 'private' ? 'desactivado' : 'activado'} con éxito`);
      loading.value = false;
      location.reload(); // Recargar la página después de cambiar el estado
    }
  } catch (error) {
    console.error(`Error al ${status === 'private' ? 'desactivar' : 'activar'} el libro:`, error.response?.data || error);
    alert(`Error al ${status === 'private' ? 'desactivar' : 'activar'} el libro`);
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
    <div class="flex items-center">
      <label class="mr-2">Disponibilidad:</label>
      <FormCheckRadio
        v-model="showAvailable"
        name="availability-switch"
        type="switch"
        label="Disponibilidad"
        :input-value="true"
      />
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
        <button @click="viewBook(book.id)" class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">
          Ver
        </button>
        <button
          @click="toggleBookStatus(book.id, book.status === 'publish' ? 'private' : 'publish')"
          class="bg-red-500 text-white py-2 px-4 rounded w-full"
        >
          {{ book.status === 'publish' ? 'Desactivar' : 'Activar' }}
        </button>
      </div>
    </div>
  </div>
</template>
