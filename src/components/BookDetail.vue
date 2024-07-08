<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const props = defineProps({
  bookId: {
    type: Number,
    required: true,
  },
});

const book = ref(null);
const loading = ref(false);

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const fetchBookDetails = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `https://cindyl23.sg-host.com/wp-json/wc/v3/products/${props.bookId}`,
      {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      }
    );
    book.value = response.data;
  } catch (error) {
    console.error("Error fetching book details:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBookDetails);
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div
        class="border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-10 h-10 animate-spin"
      ></div>
    </div>
    <div v-else>
      <h2 class="text-2xl font-semibold mb-4">{{ book?.name }}</h2>
      <img :src="book?.images[0]?.src" alt="Book cover" class="h-48 w-32 object-cover mb-4"/>
      <p><strong>Precio:</strong> ${{ book?.price }}</p>
      <p v-if="book?.virtual != true"><strong>Stock:</strong> {{ book?.stock_quantity }}</p>
      <p><strong>Descripción:</strong> <span v-html="book?.description"></span></p>
      <p><strong>Categoría:</strong> {{ book?.categories[0]?.name }}</p>
      <p><strong>Formato:</strong> {{ book?.attributes.find(attr => attr.name === 'Formato')?.options[0] }}</p>
      <p><strong>Autor:</strong> {{ book?.attributes.find(attr => attr.name === 'Autor')?.options[0] }}</p>
      <p><strong>ISBN:</strong> {{ book?.attributes.find(attr => attr.name === 'ISBN')?.options[0] }}</p>
      <p><strong>Editorial:</strong> {{ book?.attributes.find(attr => attr.name === 'Editorial')?.options[0] }}</p>
      <p><strong>Estado:</strong> {{ book?.attributes.find(attr => attr.name === 'Estado')?.options[0] }}</p>
      <button @click="$emit('close')" class="bg-blue-500 text-white py-2 px-4 rounded mt-4">
        Cerrar
      </button>
    </div>
  </div>
</template>
