<script setup>
import { defineProps } from "vue";
import { mdiEye, mdiClose, mdiPlus } from "@mdi/js";
import { useRouter } from 'vue-router';

const router = useRouter();

// Navegar al formulario de nueva editorial
const goToNewPublisher = () => {
  router.push({ name: 'publisherForm' });
};

const props = defineProps({
  publishers: {
    type: Array,
    required: true,
  },
});

// Manejar la edición de la editorial
const handleEdit = (publisher) => {
  console.log("Editar editorial:", publisher);
};

// Manejar la deshabilitación de la editorial
const handleDisable = (publisher) => {
  console.log("Deshabilitar editorial:", publisher);
};
</script>

<template>
  <!-- Botón para agregar nueva editorial -->
  <button
    @click="goToNewPublisher"
    class="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300 flex items-center mb-4"
  >
    <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path :d="mdiPlus" />
    </svg>
    Nueva Editorial
  </button>
  
  <!-- Tabla de editoriales -->
  <table class="min-w-full bg-white border border-gray-300">
    <thead>
      <tr>
        <th class="py-2 px-3 border-b border-gray-300">Nombre</th>
        <th class="py-2 px-3 border-b border-gray-300">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="publisher in publishers" :key="publisher.id">
        <td class="py-2 px-3 border-b border-gray-300">{{ publisher.name }}</td>
        <td class="py-2 px-3 border-b border-gray-300 flex space-x-2">
          <!-- Botón de editar -->
          <button 
            @click="handleEdit(publisher)" 
            class="bg-blue-500 text-white px-3 py-1 rounded-full shadow hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path :d="mdiEye" />
            </svg>
          </button>
          <!-- Botón de deshabilitar -->
          <button 
            @click="handleDisable(publisher)" 
            class="bg-gray-500 text-white px-3 py-1 rounded-full shadow hover:bg-gray-600 transition duration-300 flex items-center"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path :d="mdiClose" />
            </svg>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
