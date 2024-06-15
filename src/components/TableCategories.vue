<script setup>
import { defineProps } from "vue";
import { useRouter } from 'vue-router'

const router = useRouter()

const goToNewCategory = () => {
  router.push({ name: 'categoryForm' })
}

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
});

const handleEdit = (category) => {
  console.log("Edit category:", category);
};

const handleDelete = (category) => {
  console.log("Delete category:", category);
};
</script>

<template>
  <div class="overflow-x-auto">
    <div class="flex justify-between items-center mb-4">
      <button
      @click="goToNewCategory" class="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300 flex items-center"
      >
        <span class="mdi mdi-plus mr-2"></span> Nueva Categoría
      </button>
      <div class="relative w-1/3">
        <input
          type="text"
          placeholder="Buscar categoría por nombre"
          class="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none transition duration-300"
        />
        <span
          class="mdi mdi-magnify absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        ></span>
      </div>
    </div>

    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th class="py-2 px-3 border-b border-gray-300">Imagen</th>
          <th class="py-2 px-3 border-b border-gray-300">Nombre</th>
          <th class="py-2 px-3 border-b border-gray-300">Descripción</th>
          <th class="py-2 px-3 border-b border-gray-300">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category.id">
          <td class="py-2 px-3 border-b border-gray-300">
            <img
              :src="category.image?.src || 'https://via.placeholder.com/150'"
              alt="Imagen de la categoría"
              class="h-20"
            />
          </td>
          <td class="py-2 px-3 border-b border-gray-300">
            {{ category.name }}
          </td>
          <td class="py-2 px-3 border-b border-gray-300">
            {{ category.description }}
          </td>
          <td class="py-2 px-3 border-b border-gray-300">
            <button
              @click="handleEdit(category)"
              class="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Editar
            </button>
            <button
              @click="handleDelete(category)"
              class="bg-red-500 text-white px-3 py-1 rounded ml-2"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  text-align: left;
  padding: 8px;
}
button {
  cursor: pointer;
}
</style>
