<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const bookData = route.query.bookData ? JSON.parse(route.query.bookData) : null;

const form = ref({
  name: bookData ? bookData.name : '',
  price: bookData ? bookData.price : '',
  stock_quantity: bookData ? bookData.stock_quantity : '',
  description: bookData ? bookData.description : '',
  categories: bookData ? bookData.categories[0]?.id : '',
  format: bookData ? bookData.attributes.find(attr => attr.name === 'Formato')?.options[0] : '',
  author: bookData ? bookData.attributes.find(attr => attr.name === 'Autor')?.options[0] : '',
  isbn: bookData ? bookData.attributes.find(attr => attr.name === 'ISBN')?.options[0] : '',
  editorial: bookData ? bookData.attributes.find(attr => attr.name === 'Editorial')?.options[0] : '',
  estado: bookData ? bookData.attributes.find(attr => attr.name === 'Estado')?.options[0] : '',
  image: bookData ? bookData.images[0]?.src : '',
  download_link: bookData ? bookData.downloads[0]?.file : '',
});

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const loading = ref(false);
const error = ref(null);

const saveBook = async () => {
  loading.value = true;
  error.value = null;

  try {
    const url = bookData
      ? `https://cindyl23.sg-host.com/wp-json/wc/v3/products/${bookData.id}`
      : 'https://cindyl23.sg-host.com/wp-json/wc/v3/products';

    const method = bookData ? 'put' : 'post';

    await axios({
      method,
      url,
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      data: {
        name: form.value.name,
        regular_price: form.value.price,
        stock_quantity: form.value.stock_quantity,
        description: form.value.description,
        categories: [{ id: form.value.categories }],
        images: [{ src: form.value.image }],
        downloads: [{ file: form.value.download_link }],
        attributes: [
          { name: 'Formato', options: [form.value.format] },
          { name: 'Autor', options: [form.value.author] },
          { name: 'ISBN', options: [form.value.isbn] },
          { name: 'Editorial', options: [form.value.editorial] },
          { name: 'Estado', options: [form.value.estado] },
        ],
      },
    });

    alert('Libro guardado correctamente');
    router.push('/books'); // Redirige a la lista de libros
  } catch (err) {
    console.error('Error saving book:', err);
    error.value = 'Hubo un problema al guardar el libro. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <LayoutAuthenticated>

 
    <SectionMain>

 
  <div class="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
    <nav class="mb-4">
      <router-link to="/books" class="text-blue-500">Lista de Libros</router-link>
      <span> / </span>
      <span>{{ bookData ? 'Editar Libro' : 'Nuevo Libro' }}</span>
    </nav>
    <h2 class="text-2xl font-semibold mb-4">{{ bookData ? 'Editar Libro' : 'Nuevo Libro' }}</h2>
    <form @submit.prevent="saveBook">
      <div class="mb-4">
        <label for="name" class="block text-gray-700">Nombre</label>
        <input type="text" v-model="form.name" :placeholder="bookData?.name || ''" id="name" class="w-full p-2 border border-gray-300 rounded mt-1" required>
      </div>
      <div class="mb-4">
        <label for="price" class="block text-gray-700">Precio</label>
        <input type="number" v-model="form.price" :placeholder="bookData?.price || ''" id="price" class="w-full p-2 border border-gray-300 rounded mt-1" required>
      </div>
      <div class="mb-4">
        <label for="stock_quantity" class="block text-gray-700">Cantidad en Stock</label>
        <input type="number" v-model="form.stock_quantity" :placeholder="bookData?.stock_quantity || ''" id="stock_quantity" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="description" class="block text-gray-700">Descripción</label>
        <textarea v-model="form.description" :placeholder="bookData?.description || ''" id="description" class="w-full p-2 border border-gray-300 rounded mt-1"></textarea>
      </div>
      <div class="mb-4">
        <label for="categories" class="block text-gray-700">Categoría</label>
        <input type="number" v-model="form.categories" :placeholder="bookData?.categories[0]?.id || ''" id="categories" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="format" class="block text-gray-700">Formato</label>
        <input type="text" v-model="form.format" :placeholder="bookData?.attributes.find(attr => attr.name === 'Formato')?.options[0] || ''" id="format" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="author" class="block text-gray-700">Autor</label>
        <input type="text" v-model="form.author" :placeholder="bookData?.attributes.find(attr => attr.name === 'Autor')?.options[0] || ''" id="author" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="isbn" class="block text-gray-700">ISBN</label>
        <input type="text" v-model="form.isbn" :placeholder="bookData?.attributes.find(attr => attr.name === 'ISBN')?.options[0] || ''" id="isbn" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="editorial" class="block text-gray-700">Editorial</label>
        <input type="text" v-model="form.editorial" :placeholder="bookData?.attributes.find(attr => attr.name === 'Editorial')?.options[0] || ''" id="editorial" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="estado" class="block text-gray-700">Estado</label>
        <input type="text" v-model="form.estado" :placeholder="bookData?.attributes.find(attr => attr.name === 'Estado')?.options[0] || ''" id="estado" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="image" class="block text-gray-700">Imagen URL</label>
        <input type="text" v-model="form.image" :placeholder="bookData?.images[0]?.src || ''" id="image" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mb-4">
        <label for="download_link" class="block text-gray-700">Enlace de Descarga</label>
        <input type="text" v-model="form.download_link" :placeholder="bookData?.downloads[0]?.file || ''" id="download_link" class="w-full p-2 border border-gray-300 rounded mt-1">
      </div>
      <div class="mt-4">
        <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
      <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
    </form>
    <div v-if="form.image" class="mt-4">
      <img :src="form.image" alt="Imagen del libro" class="w-full h-auto" />
    </div>
    <div v-if="form.download_link" class="mt-4">
      <a :href="form.download_link" class="text-blue-500" download>Descargar Libro</a>
    </div>
  </div>
</SectionMain>
</LayoutAuthenticated>
</template>
