<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOutline"
        title="Solicitudes de Libros"
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
                placeholder="Buscar por título o autor"
                @input="applyFilters"
              />
              <BaseIcon
                :path="mdiMagnify"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <div class="relative">
              <select
                v-model="filters.category"
                class="appearance-none bg-transparent pr-8 pl-4 py-2 border rounded"
                @change="applyFilters"
              >
                <option value="">Todas las categorías</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="relative">
              <select
                v-model="filters.status"
                class="appearance-none bg-transparent pr-8 pl-4 py-2 border rounded"
                @change="applyFilters"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="archived">Archivado</option>
                <option value="approved">Aprobada</option>
                <option value="declined">Rechazada</option>
              </select>
            </div>
            <div class="relative">
              <div class="flex items-center">
                <span class="mr-2">Mostrar archivadas</span>
                <label class="switch">
                  <input
                    type="checkbox"
                    v-model="filters.showArchived"
                    @change="applyFilters"
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <table class="table-auto w-full">
            <thead>
              <tr>
                <th
                  class="px-4 py-2 cursor-pointer"
                  @click="sortTable('title')"
                >
                  Título
                </th>
                <th
                  class="px-4 py-2 cursor-pointer"
                  @click="sortTable('author')"
                >
                  Autor
                </th>
                <th
                  class="px-4 py-2 cursor-pointer"
                  @click="sortTable('categoryName')"
                >
                  Categoría
                </th>
                <th
                  class="px-4 py-2 cursor-pointer"
                  @click="sortTable('status')"
                >
                  Estado
                </th>
                <th
                  class="px-4 py-2 cursor-pointer"
                  @click="sortTable('createdAt')"
                >
                  Fecha
                </th>
                <th class="px-4 py-2">Hora</th>
                <th class="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in paginatedRequests" :key="request.id">
    <td class="border px-4 py-2">{{ request.title }}</td>
    <td class="border px-4 py-2">{{ request.authorName || "Cargando..." }}</td>
                <td class="border px-4 py-2">
                  {{ request.categoryName || "Cargando..." }}
                </td>
                <td class="border px-4 py-2">
                  <span :class="statusClass(request.status)">{{
                    translateStatus(request.status)
                  }}</span>
                </td>
                <td class="border px-4 py-2">
                  {{
                    new Date(
                      request.createdAt.seconds * 1000
                    ).toLocaleDateString()
                  }}
                </td>
                <td class="border px-4 py-2">
                  {{
                    new Date(
                      request.createdAt.seconds * 1000
                    ).toLocaleTimeString()
                  }}
                </td>
                <td class="border px-4 py-2 flex justify-center space-x-2">
                  <BaseButton
                    color="info"
                    :icon="mdiEye"
                    small
                    @click="() => viewRequest(request)"
                  />
                  <BaseButton
                    :color="
                      request.status === 'archived' ? 'success' : 'warning'
                    "
                    :icon="
                      request.status === 'archived'
                        ? mdiRestore
                        : mdiArchiveOutline
                    "
                    small
                    @click="() => toggleRequestStatus(request)"
                    :disabled="loadingStates[request.id]"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Paginación -->
          <div class="mt-4 flex justify-between items-center">
            <span
              >Mostrando {{ paginatedRequests.length }} de
              {{ filteredRequests.length }} solicitudes</span
            >
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
import {
  fetchRequests,
  fetchApprovedRequests,
  fetchDeclinedRequests,
  fetchRequestById,
  updateRequestStatus,
} from "@/api/firebase";
import { fetchCategories, fetchCategoryById, fetchAuthorById } from "@/api/woocommerce";



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
  mdiArchiveOutline,
  mdiRestore,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFilterOutline,
  mdiFilterMenu,
} from "@mdi/js";

const router = useRouter();
const requests = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const loadingStates = ref({});



const getAuthorName = async (authorId) => {
  if (!isNaN(authorId)) {
    try {
      const author = await fetchAuthorById(authorId);
      return author.name;
    } catch (error) {
      console.error(`Error fetching author name for ID ${authorId}:`, error);
      return "Autor desconocido";
    }
  }
  return authorId; // Si no es un número, devolvemos el valor original
};

const filters = ref({
  search: "",
  category: "",
  status: "",
  showArchived: false,
});

const currentPage = ref(1);
const itemsPerPage = 10;
const sortKey = ref("");
const sortOrder = ref(1);

const fetchRequestsData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [pendingRequests, approvedRequests, declinedRequests] =
      await Promise.all([
        fetchRequests(),
        fetchApprovedRequests(),
        fetchDeclinedRequests(),
      ]);

    const processedRequests = [
      ...pendingRequests.map((req) => ({ ...req, status: "pending" })),
      ...approvedRequests.map((req) => ({ ...req, status: "approved" })),
      ...declinedRequests.map((req) => ({ ...req, status: "declined" })),
    ];

    requests.value = await Promise.all(
      processedRequests.map(async (request) => {
        const categoryName = await getCategoryName(request.category);
        const authorName = await getAuthorName(request.author);
        return { ...request, categoryName, authorName };
      })
    );
    console.log("Requests loaded:", requests.value);
  } catch (err) {
    console.error("Error fetching requests:", err);
    error.value = "Failed to load requests.";
  } finally {
    loading.value = false;
  }
};

const fetchCategoriesData = async () => {
  try {
    const { data } = await fetchCategories();
    categories.value = data;
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

const viewRequest = async (request) => {
  try {
    console.log(`Opening request`, request);
    const requestData = await fetchRequestById(request.id);
    console.log("Request Data:", requestData);
    router.push({ name: "requestDetailView", params: { id: request.id } });
  } catch (error) {
    console.error("Error viewing request:", error);
  }
};

const toggleRequestStatus = async (request) => {
  loadingStates.value[request.id] = true;
  error.value = null;
  try {
    const newStatus = request.status === "archived" ? "pending" : "archived";
    console.log(`Updating request ${request.id} status to ${newStatus}...`);
    await updateRequestStatus(request.id, newStatus);
    request.status = newStatus; // Actualiza el estado localmente
    console.log(`Request ${request.id} status updated to ${newStatus}.`);
  } catch (err) {
    console.error("Error updating request status:", err);
    error.value = `Failed to update status for request ${request.id}.`;
  } finally {
    loadingStates.value[request.id] = false;
  }
};

const statusClass = (status) => {
  if (status === "archived") return "text-red-500";
  if (status === "approved") return "text-green-500";
  if (status === "declined") return "text-yellow-500";
  return "text-blue-500";
};

const translateStatus = (status) => {
  if (status === "archived") return "Archivado";
  if (status === "approved") return "Aprobada";
  if (status === "declined") return "Rechazada";
  return "Pendiente";
};

const applyFilters = () => {
  currentPage.value = 1;
};

const sortTable = (key) => {
  if (sortKey.value === key) {
    sortOrder.value *= -1;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

const filteredRequests = computed(() => {
  console.log("Filtering requests. showArchived:", filters.value.showArchived);
  const sortedRequests = [...requests.value].sort((a, b) => {
    const aValue = a[sortKey.value];
    const bValue = b[sortKey.value];

    if (aValue > bValue) return sortOrder.value;
    if (aValue < bValue) return -sortOrder.value;
    return 0;
  });

  return sortedRequests.filter((request) => {
    const searchMatch =
      filters.value.search.toLowerCase() === "" ||
      request.title
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      request.author.toLowerCase().includes(filters.value.search.toLowerCase());
    const categoryMatch =
      filters.value.category === "" ||
      request.category === filters.value.category;
    const statusMatch =
      filters.value.status === "" || request.status === filters.value.status;
    const archivedMatch = filters.value.showArchived
      ? request.status === "archived"
      : request.status !== "archived";
    return searchMatch && categoryMatch && statusMatch && archivedMatch;
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

const getCategoryName = async (categoryId) => {
  try {
    const category = await fetchCategoryById(categoryId);
    return category.name;
  } catch (error) {
    console.error(`Error fetching category name for ID ${categoryId}:`, error);
    return "Categoría desconocida";
  }
};

onMounted(async () => {
  await fetchRequestsData();
  await fetchCategoriesData();
});

</script>

<style scoped>
.loader {
  border-top-color: #3490dc;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
