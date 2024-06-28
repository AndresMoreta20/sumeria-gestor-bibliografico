<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCategories, toggleBookStatus } from "@/api/woocommerce";
import FormCheckRadio from "@/components/FormCheckRadio.vue"; 
import FormControl from "@/components/FormControl.vue";
import LoadingIndicator from '@/components/LoadingIndicator.vue';

const router = useRouter();

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-book']); 

const categories = ref([]);
const selectedCategory = ref("all");
const selectedFormat = ref("all");
const showAvailable = ref(true);
const searchQuery = ref('');
const loading = ref(true); // Loading state for both books and categories
const categoriesLoading = ref(true); // Loading state for categories

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

  let booksByAvailability = booksByCategory.filter(book => book.status === (showAvailable.value ? "publish" : "private"));

  if (searchQuery.value) {
    booksByAvailability = booksByAvailability.filter(book =>
      book.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return booksByAvailability;
});

const goToNewBook = () => {
  router.push({ name: "newBook" });
};

const viewBook = (bookId) => {
  emit('view-book', bookId);
};

const loadCategories = async () => {
  try {
    categoriesLoading.value = true;
    const response = await fetchCategories();
    categories.value = response.data;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
  } finally {
    categoriesLoading.value = false;
  }
};

const updateBookStatus = async (bookId, status) => {
  try {
    if (confirm(`¿Estás seguro de que quieres ${status === 'private' ? 'desactivar' : 'activar'} este libro?`)) {
      loading.value = true;
      await toggleBookStatus(bookId, status);
      alert(`Libro ${status === 'private' ? 'desactivado' : 'activado'} con éxito`);
      loading.value = false;
      location.reload(); 
    }
  } catch (error) {
    console.error(`Error al ${status === 'private' ? 'desactivar' : 'activar'} el libro:`, error.response?.data || error);
    alert(`Error al ${status === 'private' ? 'desactivar' : 'activar'} el libro`);
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await loadCategories();
  loading.value = false;
});
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <div class="relative w-full">
      <FormControl v-model="searchQuery" placeholder="Buscar" transparent borderless class="pl-10 w-full" />
      <svg class="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 2C4.58172 2 1 5.58172 1 10C1 14.4183 4.58172 18 9 18C11.0861 18 13.0004 17.2078 14.4266 15.9131L19.7071 21.1924C19.9871 21.4724 20.4871 21.4724 20.7671 21.1924C21.0471 20.9124 21.0471 20.4124 20.7671 20.1324L15.4866 14.853C16.7914 13.4313 17.5 11.5456 17.5 10C17.5 5.58172 14.4183 2 9 2ZM9 4C12.3137 4 15 6.68629 15 10C15 13.3137 12.3137 16 9 16C5.68629 16 3 13.3137 3 10C3 6.68629 5.68629 4 9 4Z"/>
      </svg>
    </div>
  </div>
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
        <option v-for="category in categories" :key="category.id" :value="category.id">
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
  <div class="relative">
    <div v-if="loading || categoriesLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
      <LoadingIndicator />
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="book in filteredBooks" :key="book.id" class="bg-white rounded-lg shadow p-4 flex flex-col items-center h-full">
        <img :src="book.images[0]?.src" alt="Book cover" class="h-48 w-32 object-cover mb-4" />
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
            @click="updateBookStatus(book.id, book.status === 'publish' ? 'private' : 'publish')"
            class="bg-red-500 text-white py-2 px-4 rounded w-full"
          >
            {{ book.status === 'publish' ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
