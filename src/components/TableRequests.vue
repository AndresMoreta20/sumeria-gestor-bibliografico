<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchRequests, deleteRequest } from '@/api/firebase';
import FormControl from '@/components/FormControl.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import CardBoxModal from '@/components/CardBoxModal.vue';
import BaseButtons from '@/components/BaseButtons.vue';
import BaseButton from '@/components/BaseButton.vue';
import { mdiEye, mdiTrashCan, mdiCheckCircle } from '@mdi/js';

const router = useRouter();
const requests = ref([]);
const loading = ref(true);
const selectedCategory = ref("all");
const searchQuery = ref('');
const isModalDangerActive = ref(false);
const isSuccessModalActive = ref(false);
const requestToDelete = ref(null);

// Estado para la paginación
const currentPage = ref(1);
const requestsPerPage = 8;

const loadRequests = async () => {
  try {
    requests.value = await fetchRequests();
  } catch (error) {
    console.error('Error fetching requests:', error);
  } finally {
    loading.value = false;
  }
};

const filteredRequests = computed(() => {
  let filtered = requests.value;
  
  if (selectedCategory.value !== "all") {
    filtered = filtered.filter(request => request.category === selectedCategory.value);
  }
  
  if (searchQuery.value) {
    filtered = filtered.filter(request =>
      request.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  return filtered;
});

// Cálculo de las solicitudes que se mostrarán en la página actual
const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * requestsPerPage;
  const end = start + requestsPerPage;
  return filteredRequests.value.slice(start, end);
});

// Calcular el número total de páginas
const totalPages = computed(() => Math.ceil(filteredRequests.value.length / requestsPerPage));

const goToNewRequest = () => {
  router.push({ name: 'requestForm' });
};

const confirmDeleteRequest = async () => {
  if (requestToDelete.value) {
    try {
      await deleteRequest(requestToDelete.value);
      requests.value = requests.value.filter(request => request.id !== requestToDelete.value);
      isSuccessModalActive.value = true;
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      isModalDangerActive.value = false;
    }
  }
};

const openDeleteModal = (requestId) => {
  requestToDelete.value = requestId;
  isModalDangerActive.value = true;
};

const goToPage = (pageNumber) => {
  currentPage.value = pageNumber;
};

onMounted(loadRequests);
</script>
<template>
  <div>
    <CardBoxModal v-model="isModalDangerActive" title="Por favor confirme" button="danger" has-cancel @confirm="confirmDeleteRequest">
      <p>¿Está seguro de que desea eliminar esta solicitud?</p>
    </CardBoxModal>

    <CardBoxModal v-model="isSuccessModalActive" title="Éxito" button="success">
      <div class="flex items-center space-x-2">
        <BaseIcon :path="mdiCheckCircle" class="text-green-500" />
        <p>La solicitud se ha eliminado correctamente.</p>
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
        <label class="mr-2">Categoría:</label>
        <select v-model="selectedCategory" class="border rounded p-2 pr-10">
          <option value="all">Todas</option>
          <!-- Agregar opciones para filtrar por categoría si es necesario -->
        </select>
      </div>
      <button @click="goToNewRequest" class="bg-blue-500 text-white p-2 rounded">Nueva Solicitud</button>
    </div>
    <div class="relative">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
        <LoadingIndicator />
      </div>
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CardBox v-for="request in paginatedRequests" :key="request.id" class="flex flex-col items-center h-full border rounded-lg p-4">
            <img :src="request.imageUrl" alt="Book cover" class="h-48 w-32 object-cover mb-4">
            <h2 class="text-lg font-semibold mb-2 text-center truncate w-full">{{ request.title }}</h2>
            <p class="text-blue-500 mb-2">{{ request.regularPrice }}</p>
            <p class="text-gray-500 mb-4">{{ request.category }}</p>
            <div class="mt-auto flex justify-between w-full">
              <button @click="() => router.push({ name: 'requestForm', params: { id: request.id } })" class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">Editar</button>
              <button @click="openDeleteModal(request.id)" class="bg-red-500 text-white py-2 px-4 rounded w-full">Eliminar</button>
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
