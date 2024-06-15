<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  books: {
    type: Array,
    required: true
  }
});

const categories = ref([]);
const selectedCategory = ref('all');
const selectedFormat = ref('all');
const loading = ref(false);

const filteredBooks = computed(() => {
  let booksByCategory = props.books;
  if (selectedCategory.value !== 'all') {
    booksByCategory = props.books.filter(book => book.categories.some(category => category.id === selectedCategory.value));
  }

  if (selectedFormat.value === 'all') {
    return booksByCategory;
  }

  if (selectedFormat.value === 'physical') {
    return booksByCategory.filter(book => !book.virtual);
  }

  if (selectedFormat.value === 'digital') {
    return booksByCategory.filter(book => book.virtual);
  }
});

const goToNewBook = () => {
  router.push({ name: 'newBook' });
};

const fetchCategories = async () => {
  const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
  const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;
  try {
    const response = await axios.get('https://cindyl23.sg-host.com/wp-json/wc/v3/products/categories', {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    });
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const deleteBook = async (bookId) => {
  const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
  const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;
  try {
    if (confirm("Are you sure you want to delete this book?")) {
      loading.value = true;
      await axios.delete(`https://cindyl23.sg-host.com/wp-json/wc/v3/products/${bookId}`, {
        auth: {
          username: consumerKey,
          password: consumerSecret
        }
      });
      alert('Book deleted successfully');
      loading.value = false;
      location.reload(); // Reload the page after deletion
    }
  } catch (error) {
    console.error('Error deleting book:', error.response?.data || error);
    alert('Error deleting book');
    loading.value = false;
  }
};

onMounted(fetchCategories);
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <label class="mr-2">Format:</label>
      <select v-model="selectedFormat" class="border rounded p-2">
        <option value="all">All</option>
        <option value="physical">Físicos</option>
        <option value="digital">eBook</option>
      </select>
    </div>
    <div>
      <label class="mr-2">Category:</label>
      <select v-model="selectedCategory" class="border rounded p-2">
        <option value="all">All</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
    </div>
    <button @click="goToNewBook" class="bg-blue-500 text-white p-2 rounded">Nuevo Libro</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
      <div class="loader"></div> <!-- You can style this loader as needed -->
    </div>
    <div v-for="book in filteredBooks" :key="book.id" class="bg-white rounded-lg shadow p-4 flex flex-col items-center h-full">
      <img :src="book.images[0]?.src" alt="Book cover" class="h-48 w-32 object-cover mb-4">
      <h2 class="text-lg font-semibold mb-2 text-center truncate w-full">{{ book.name }}</h2>
      <p class="text-blue-500 mb-2">{{ book.price }}</p>
      <p class="text-gray-500 mb-4">{{ book.categories[0]?.name }}</p>
      <div class="mt-auto flex justify-between w-full">
        <button class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">Edit</button>
        <button @click="deleteBook(book.id)" class="bg-red-500 text-white py-2 px-4 rounded w-full">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure titles are truncated properly */
h2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Add styles for the loading indicator */
.loader {
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
