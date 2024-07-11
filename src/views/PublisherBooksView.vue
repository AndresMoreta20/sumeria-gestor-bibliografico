<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchCategories, toggleBookStatus, fetchBooks as apiFetchBooks } from "@/api/woocommerce";
import FormCheckRadio from "@/components/FormCheckRadio.vue"; 
import FormControl from "@/components/FormControl.vue";
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import CardBoxModal from '@/components/CardBoxModal.vue';
import UserAvatar from "@/components/UserAvatar.vue";
import BaseButtons from '@/components/BaseButtons.vue';
import BaseButton from '@/components/BaseButton.vue';
import { mdiEye, mdiTrashCan, mdiCheckCircle, mdiBook } from '@mdi/js';
import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import CardBox from "@/components/CardBox.vue";
import BookDetail from "@/components/BookDetail.vue";

const router = useRouter();

const categories = ref([]);
const selectedCategory = ref("all");
const selectedFormat = ref("all");
const showAvailable = ref(true);
const searchQuery = ref('');
const loading = ref(true);
const categoriesLoading = ref(true);
const isModalDangerActive = ref(false);
const isSuccessModalActive = ref(false);
const bookToUpdate = ref(null);
const books = ref([]);
const selectedBookId = ref(null);

const currentPage = ref(1);
const booksPerPage = 8;

const userName = sessionStorage.getItem('user-name');

const filteredBooks = computed(() => {
  let booksByCategory = books.value;

  if (selectedCategory.value !== "all") {
    booksByCategory = books.value.filter((book) =>
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
    books.value = response.filter(book => 
      book.attributes.some(attr => 
        attr.name.toLowerCase() === 'editorial' && 
        attr.options.some(option => option.toLowerCase() === userName.toLowerCase())
      )
    );
    console.log("Filtered Books:", books.value);
  } catch (error) {
    console.error("Error fetching books:", error);
  } finally {
    loading.value = false;
  }
};

const goToNewBook = () => {
  router.push({ name: "newBook" });
};

const viewBook = (bookId) => {
  selectedBookId.value = bookId;
};

const closeDetailView = () => {
  selectedBookId.value = null;
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
    loading.value = true;
    await toggleBookStatus(bookId, status);
    await fetchBooks();
    isSuccessModalActive.value = true;
  } catch (error) {
    console.error(`Error al ${status === 'private' ? 'desactivar' : 'activar'} el libro:`, error.response?.data || error);
    alert(`Error al ${status === 'private' ? 'desactivar' : 'activar'} el libro`);
  } finally {
    loading.value = false;
  }
};

const confirmUpdateStatus = () => {
  if (bookToUpdate.value) {
    updateBookStatus(bookToUpdate.value.id, bookToUpdate.value.status === 'publish' ? 'private' : 'publish');
    isModalDangerActive.value = false;
  }
};

const openDeactivateModal = (book) => {
  bookToUpdate.value = book;
  isModalDangerActive.value = true;
};

const goToPage = (pageNumber) => {
  currentPage.value = pageNumber;
};

onMounted(async () => {
  await loadCategories();
  await fetchBooks();
});
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Libros del Editor" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <template v-if="loading">
          <LoadingIndicator />
        </template>
        <template v-else-if="selectedBookId">
          <BookDetail :book-id="selectedBookId" @close="closeDetailView" />
        </template>
        <template v-else>
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
                <select v-model="selectedFormat" class="border rounded p-2 pr-10 bg-transparent">
                  <option value="all">Todos</option>
                  <option value="physical">Físicos</option>
                  <option value="digital">eBook</option>
                </select>
              </div>
              <div>
                <label class="mr-2">Categoría:</label>
                <select v-model="selectedCategory" class="border rounded p-2 pr-10 bg-transparent">
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
                  label=""
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
              <div v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <div v-for="book in paginatedBooks" :key="book.id" class="flex flex-col items-center h-full border rounded-lg p-4">
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
                    <div class="mt-auto flex justify-between w-full">
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
                  </div>
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
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
