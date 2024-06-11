<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  books: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <label class="mr-2">Format:</label>
      <select class="border rounded p-2">
        <option value="all">All</option>
        <option value="ebook">eBook</option>
        <option value="physical">Physical book</option>
      </select>
    </div>
    <div>
      <label class="mr-2">Category:</label>
      <select class="border rounded p-2">
        <option value="all">All</option>
        <option value="romance">Romance</option>
        <option value="action">Action</option>
      </select>
    </div>
    <button class="bg-blue-500 text-white p-2 rounded">Add New Book</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div v-for="book in books" :key="book.id" class="bg-white rounded-lg shadow p-4 flex flex-col items-center h-full">
      <img :src="book.images[0]?.src" alt="Book cover" class="h-48 w-32 object-cover mb-4">
      <h2 class="text-lg font-semibold mb-2 text-center truncate w-full">{{ book.name }}</h2>
      <p class="text-blue-500 mb-2">{{ book.price }}</p>
      <p class="text-gray-500 mb-4">{{ book.categories[0]?.name }}</p>
      <div class="mt-auto flex justify-between w-full">
        <button class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">Edit</button>
        <button class="bg-red-500 text-white py-2 px-4 rounded w-full">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Asegúrate de que los títulos se trunquen adecuadamente */
h2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
