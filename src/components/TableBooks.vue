<template>
  <div>
    <CardBoxModal v-model="isModalDangerActive" title="Por favor confirme" button="danger" has-cancel @confirm="confirmUpdateStatus">
      <p>¿Está seguro de que desea cambiar el estado de este libro?</p>
    </CardBoxModal>

    <CardBoxModal v-model="isSuccessModalActive" title="Éxito" button="success">
      <div class="flex items-center space-x-2">
        <BaseIcon :path="mdiCheckCircle" class="text-green-500" />
        <p>El estado del libro se ha actualizado correctamente.</p>
      </div>
    </CardBoxModal>

    <div class="mb-6">
      <div class="relative w-full mb-4">
        <FormControl v-model="searchQuery" placeholder="Buscar" transparent borderless class="pl-10 w-full" />
        <svg class="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 2C4.58172 2 1 5.58172 1 10C1 14.4183 4.58172 18 9 18C11.0861 18 13.0004 17.2078 14.4266 15.9131L19.7071 21.1924C19.9871 21.4724 20.4871 21.4724 20.7671 21.1924C21.0471 20.9124 21.0471 20.4124 20.7671 20.1324L15.4866 14.853C16.7914 13.4313 17.5 11.5456 17.5 10C17.5 5.58172 14.4183 2 9 2ZM9 4C12.3137 4 15 6.68629 15 10C15 13.3137 12.3137 16 9 16C5.68629 16 3 13.3137 3 10C3 6.68629 5.68629 4 9 4Z"/>
        </svg>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block mb-1">Formato:</label>
          <select v-model="selectedFormat" class="w-full border rounded p-2 bg-transparent">
            <option value="all">Todos</option>
            <option value="physical">Físicos</option>
            <option value="digital">eBook</option>
          </select>
        </div>
        <div>
          <label class="block mb-1">Categoría:</label>
          <select v-model="selectedCategory" class="w-full border rounded p-2 bg-transparent">
            <option value="all">Todas</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block mb-1">Autor:</label>
          <select v-model="selectedAuthor" class="w-full border rounded p-2 bg-transparent">
  <option value="all">Todos</option>
  <option v-for="author in authors" :key="author.id" :value="author.name">
    {{ author.name }}
  </option>
</select>
        </div>
        <div>
          <label class="block mb-1">Idioma:</label>
          <select v-model="selectedLanguage" class="w-full border rounded p-2 bg-transparent">
  <option value="all">Todos</option>
  <option v-for="language in languages" :key="language.id" :value="language.name">
    {{ language.name }}
  </option>
</select>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="mr-2">Disponibilidad:</label>
          <FormCheckRadio
            v-model="showAvailable"
            name="availability-switch"
            type="switch"
            label=""
            :input-value="true"
            @change="handleAvailabilitySwitch"
          />
        </div>
        <button v-if="userRole !== 'publisher'" @click="goToNewBook" class="bg-blue-500 text-white p-2 rounded">
          Nuevo Libro
        </button>
      </div>
    </div>
    <div class="relative">
      <div v-if="loading || categoriesLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <LoadingIndicator />
      </div>
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CardBox v-for="book in paginatedBooks" :key="book.id" class="flex flex-col items-center h-full border rounded-lg p-4">
            <img :src="book.images[0]?.src || 'default-cover.jpg'" alt="Book cover" class="h-48 w-32 object-cover mb-4" />
            <h2 class="text-lg font-semibold mb-2 text-center truncate w-full">
              {{ book.name }}
            </h2>
            <p class="text-blue-500 mb-2">${{ book.price }}</p>
            <p v-if="book.virtual != true" class="text-blue-500 mb-2">Stock: {{ book.stock_quantity }}</p>
            <p class="text-gray-500 mb-2">{{ book.categories[0]?.name }}</p>
            <p class="text-gray-500 mb-2">{{ book.publisher }}</p>
            <p class="text-gray-500 mb-4">
              {{
                book.attributes.find((attr) => attr.name === "Formato")?.options[0]
              }}
            </p>
            <div v-if="userRole !== 'publisher'" class="mt-auto flex justify-between w-full">
              <button @click="viewBook(book.id)" class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">
                Ver
              </button>
              <button
                @click="openDeactivateModal(book)"
                class="bg-red-500 text-white py-2 px-4 rounded w-full"
              >
                {{ book.status === 'publish' ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </CardBox>
        </div>
        <div class="mt-4 flex justify-center space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="{'bg-blue-500 text-white': page === currentPage, 'bg-gray-300 text-black': page !== currentPage}"
            class="px-4 py-2 rounded"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCategories, fetchAuthors, fetchLanguages, toggleBookStatus, fetchBooks as apiFetchBooks, fetchTrashedProducts, restoreProduct } from "@/api/woocommerce";
import FormCheckRadio from "@/components/FormCheckRadio.vue"; 
import FormControl from "@/components/FormControl.vue";
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import CardBoxModal from '@/components/CardBoxModal.vue';
import UserAvatar from "@/components/UserAvatar.vue";
import BaseButtons from '@/components/BaseButtons.vue';
import BaseButton from '@/components/BaseButton.vue';
import { mdiEye, mdiTrashCan, mdiCheckCircle } from '@mdi/js';

const router = useRouter();

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-book']); 

const categories = ref([]);
const authors = ref([]);
const languages = ref([]);
const selectedCategory = ref("all");
const selectedFormat = ref("all");
const selectedAuthor = ref("all");
const selectedLanguage = ref("all");
const showAvailable = ref(true);
const searchQuery = ref('');
const loading = ref(true);
const categoriesLoading = ref(true);
const authorsLoading = ref(true);
const languagesLoading = ref(true);
const isModalDangerActive = ref(false);
const isSuccessModalActive = ref(false);
const bookToUpdate = ref(null);
const books = ref(props.books);

const currentPage = ref(1);
const booksPerPage = 8;

const userRole = ref(sessionStorage.getItem('user-role'));

const filteredBooks = computed(() => {
  let filtered = books.value;

  if (selectedCategory.value !== "all") {
    filtered = filtered.filter((book) =>
      book.categories.some((category) => category.id === parseInt(selectedCategory.value))
    );
  }

  if (selectedFormat.value !== "all") {
    filtered = filtered.filter((book) =>
      selectedFormat.value === "physical" ? !book.virtual : book.virtual
    );
  }

  if (selectedAuthor.value !== "all") {
    filtered = filtered.filter((book) =>
      book.attributes.some(attr => 
        attr.name === "Autor" && attr.options.some(option => 
          option.toLowerCase() === selectedAuthor.value.toLowerCase()
        )
      )
    );
  }

  if (selectedLanguage.value !== "all") {
    filtered = filtered.filter((book) =>
      book.attributes.some(attr => 
        attr.name === "Idioma" && attr.options.some(option => 
          option.toLowerCase() === selectedLanguage.value.toLowerCase()
        )
      )
    );
  }

  filtered = filtered.filter(book => book.status === (showAvailable.value ? "publish" : "trash"));

  if (searchQuery.value) {
    filtered = filtered.filter(book =>
      book.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * booksPerPage;
  const end = start + booksPerPage;
  return filteredBooks.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / booksPerPage));

const fetchBooks = async () => {
  try {
    loading.value = true;
    const response = await apiFetchBooks();
    books.value = response;
    console.log("Books fetched:", response);
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    loading.value = false;
  }
};

const fetchTrashedBooks = async () => {
  try {
    loading.value = true;
    const response = await fetchTrashedProducts();
    books.value = response;
    console.log("Trashed books fetched:", response);
  } catch (error) {
    console.error("Error fetching trashed books:", error);
  } finally {
    loading.value = false;
  }
};

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

const loadAuthors = async () => {
  try {
    authorsLoading.value = true;
    const response = await fetchAuthors();
    authors.value = response.data;
  } catch (error) {
    console.error("Error al obtener autores:", error);
  } finally {
    authorsLoading.value = false;
  }
};

const loadLanguages = async () => {
  try {
    languagesLoading.value = true;
    const response = await fetchLanguages();
    languages.value = response.data;
  } catch (error) {
    console.error("Error al obtener idiomas:", error);
  } finally {
    languagesLoading.value = false;
  }
};

const updateBookStatus = async (bookId, status) => {
  try {
    loading.value = true;
    if (status === 'trash') {
      await toggleBookStatus(bookId, status);
    } else {
      await restoreProduct(bookId);
    }
    await fetchBooks();
    isSuccessModalActive.value = true;
  } catch (error) {
    console.error(`Error al ${status === 'publish' ? 'activar' : 'desactivar'} el libro:`, error.response?.data || error);
    alert(`Error al ${status === 'publish' ? 'activar' : 'desactivar'} el libro`);
  } finally {
    loading.value = false;
  }
};

const confirmUpdateStatus = () => {
  if (bookToUpdate.value) {
    updateBookStatus(bookToUpdate.value.id, bookToUpdate.value.status === 'publish' ? 'trash' : 'publish');
    isModalDangerActive.value = false;
  }
};

const openDeactivateModal = (book) => {
  bookToUpdate.value = book;
  isModalDangerActive.value = true;
  console.log("Deactivate modal opened for book:", book);
};

const goToPage = (pageNumber) => {
  currentPage.value = pageNumber;
};

const handleAvailabilitySwitch = async () => {
  console.log("Switch availability changed to:", showAvailable.value);
  if (showAvailable.value) {
    await fetchBooks();
  } else {
    await fetchTrashedBooks();
  }
};

onMounted(async () => {
  await Promise.all([loadCategories(), loadAuthors(), loadLanguages()]);
  await fetchBooks();
});
</script>
