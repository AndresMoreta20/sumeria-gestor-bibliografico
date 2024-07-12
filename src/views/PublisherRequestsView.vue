<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOutline"
        title="Solicitudes de Editoriales"
        main
      />
      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div
            class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-8 h-8 animate-spin"
          ></div>
        </div>
        <div v-if="error" class="text-red-500 p-4">{{ error }}</div>
        <div v-else>
          <div class="mb-4 flex flex-wrap gap-4">
            <div class="relative">
              <input
                v-model="filters.search"
                class="pl-10 px-4 py-2 border rounded"
                placeholder="Buscar por nombre o correo"
                @input="applyFilters"
              />
              <BaseIcon
                :path="mdiMagnify"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <table class="table-auto w-full">
            <thead>
              <tr>
                <th class="px-4 py-2">Nombre</th>
                <th class="px-4 py-2">RUC</th>
                <th class="px-4 py-2">Correo</th>
                <th class="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in paginatedRequests" :key="request.id">
                <td class="border px-4 py-2">{{ request.razonSocial }}</td>
                <td class="border px-4 py-2">{{ request.ruc }}</td>
                <td class="border px-4 py-2">{{ request.email }}</td>
                <td class="border px-4 py-2 flex justify-center space-x-2">
                  <BaseButton
                    color="info"
                    :icon="mdiEye"
                    small
                    @click="() => viewRequest(request.id)"
                  />
                  <BaseButton
                    color="danger"
                    :icon="mdiDelete"
                    small
                    @click="() => removeRequest(request.id)"
                    :disabled="loadingStates[request.id]"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Paginación -->
          <div class="mt-4 flex justify-between items-center">
            <span>
              Mostrando {{ paginatedRequests.length }} de {{ filteredRequests.length }} solicitudes
            </span>
            <div class="space-x-2">
              <BaseButton
                :disabled="currentPage === 1"
                @click="currentPage--"
                :icon="mdiChevronLeft"
                small
              />
              <span>Página {{ currentPage }} de {{ totalPages }}</span>
              <BaseButton
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                :icon="mdiChevronRight"
                small
              />
            </div>
          </div>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchPublisherRequests, deletePublisherRequest } from "@/api/firebase";

import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import CardBox from "@/components/CardBox.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {
  mdiBookOutline,
  mdiMagnify,
  mdiEye,
  mdiDelete,
  mdiChevronLeft,
  mdiChevronRight,
} from "@mdi/js";

const router = useRouter();
const requests = ref([]);
const loading = ref(true);
const error = ref(null);
const loadingStates = ref({});

const filters = ref({
  search: "",
});

const currentPage = ref(1);
const itemsPerPage = 10;

const fetchRequestsData = async () => {
  loading.value = true;
  error.value = null;
  try {
    requests.value = await fetchPublisherRequests();
  } catch (err) {
    console.error("Error fetching requests:", err);
    error.value = "Failed to load requests.";
  } finally {
    loading.value = false;
  }
};

const viewRequest = (requestId) => {
  router.push({ name: "PublisherCheckView", params: { id: requestId } });
};

const removeRequest = async (requestId) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
    try {
      loadingStates.value[requestId] = true;
      await deletePublisherRequest(requestId);
      await fetchRequestsData();
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      loadingStates.value[requestId] = false;
    }
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const filteredRequests = computed(() => {
  return requests.value.filter((request) => {
    const searchMatch =
      filters.value.search.toLowerCase() === "" ||
      request.razonSocial.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      request.email.toLowerCase().includes(filters.value.search.toLowerCase());
    return searchMatch;
  });
});

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRequests.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredRequests.value.length / itemsPerPage)
);

onMounted(fetchRequestsData);
</script>

<style scoped>
.loader {
  border-top-color: #3490dc;
}
</style>
