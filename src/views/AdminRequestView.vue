<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { mdiBook, mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';
import BaseButton from '@/components/BaseButton.vue';
import { fetchRequests, approveRequest as approveRequestFirebase, rejectRequest as rejectRequestFirebase } from '@/api/firebase';
import { uploadProduct, fetchCategoryById, fetchAuthorById, fetchLanguageById, fetchPublisherById, checkSkuExists } from '@/api/woocommerce';

const router = useRouter();
const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const requests = ref([]);
const loading = ref(true);
const loadingStates = ref({});

const loadWooCommerceData = async (request) => {
  try {
    if (!isNaN(request.category)) {
      request.categoryName = await fetchCategoryById(request.category).then(res => res.name);
    } else {
      request.categoryName = request.category;
    }

    if (!isNaN(request.author)) {
      request.authorName = await fetchAuthorById(request.author).then(res => res.name);
    } else {
      request.authorName = request.author;
    }

    if (!isNaN(request.language)) {
      request.languageName = await fetchLanguageById(request.language).then(res => res.name);
    } else {
      request.languageName = request.language;
    }

    if (!isNaN(request.publisher)) {
      request.publisherName = await fetchPublisherById(request.publisher).then(res => res.name);
    } else {
      request.publisherName = request.publisher;
    }
  } catch (error) {
    console.error('Error fetching WooCommerce data:', error);
  }
};

const fetchRequestsData = async () => {
  try {
    requests.value = await fetchRequests();

    for (const request of requests.value) {
      await loadWooCommerceData(request);
    }
    loading.value = false;
  } catch (error) {
    console.error('Error fetching requests:', error);
    loading.value = false;
  }
};

const generateUniqueSku = async (baseSku) => {
  let sku = baseSku;
  let suffix = 1;
  while (await checkSkuExists(sku)) {
    sku = `${baseSku}-${suffix}`;
    suffix += 1;
  }
  return sku;
};

const approveRequest = async (request) => {
  try {
    loadingStates.value[request.id] = true;

    const baseSku = request.sku || `SKU${Date.now()}`;
    const uniqueSku = await generateUniqueSku(baseSku);

    const data = {
      name: request.title,
      type: "simple",
      regular_price: String(request.regularPrice || '0'),
      sale_price: request.salePrice ? String(request.salePrice) : '',
      description: request.description,
      short_description: request.shortDescription,
      categories: [{ id: parseInt(request.category) }],
      images: request.coverUrl ? [{ src: request.coverUrl, name: request.coverFileName }] : [],
      attributes: [
        { id: 1, name: "Autor", options: [request.authorName], visible: true, variation: false },
        { id: 3, name: "ISBN", options: [request.isbn], visible: true, variation: false },
        { id: 4, name: "Editorial", options: [request.publisherName], visible: true, variation: false },
        { id: 2, name: "Formato", options: [request.format], visible: true, variation: false },
        { id: 7, name: "Idioma", options: [request.languageName], visible: true, variation: false },
        { id: 6, name: "Encuadernación", options: ["Tapa blanda"], visible: true, variation: false },
        { id: 5, name: "Estado", options: ["Nuevo"], visible: true, variation: false }
      ],
      manage_stock: true,
      stock_quantity: request.stockQuantity || 100,
      sku: uniqueSku,
    };

    if (request.format.toLowerCase() === 'e-book') {
      data.virtual = true;
      data.downloadable = true;
      data.downloads = [
        { name: 'Digital Book', file: request.fileUrl }
      ];
    } else {
      data.virtual = false;
      data.downloadable = false;
    }

    if (!data.sale_price) {
      delete data.sale_price;
    }

    console.log('Sending data to WooCommerce:', JSON.stringify(data, null, 2)); 

    const response = await uploadProduct(data);

    console.log('Book uploaded successfully:', response);

    await approveRequestFirebase(request);
    fetchRequestsData();
  } catch (error) {
    console.error('Error approving request:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      alert(`Error approving request: ${error.response.data.message}`);
    } else {
      alert('Error approving request: ' + error.message);
    }
  } finally {
    loadingStates.value[request.id] = false;
  }
};

const rejectRequest = async (request) => {
  try {
    loadingStates.value[request.id] = true;
    await rejectRequestFirebase(request);
    fetchRequestsData();
  } catch (error) {
    console.error('Error rejecting request:', error);
    alert('Error rejecting request');
  } finally {
    loadingStates.value[request.id] = false;
  }
};

onMounted(fetchRequestsData);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Solicitudes de Libros" main />
      
      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-5 h-5 animate-spin"></div>
        </div>
        <div v-else>
          <table class="table-auto w-full">
            <thead>
              <tr>
                <th class="px-4 py-2">Título</th>
                <th class="px-4 py-2">Autor</th>
                <th class="px-4 py-2">Categoría</th>
                <th class="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td class="border px-4 py-2">{{ request.title }}</td>
                <td class="border px-4 py-2">{{ request.authorName }}</td>
                <td class="border px-4 py-2">{{ request.categoryName }}</td>
                <td class="border px-4 py-2 flex justify-center space-x-2">
                  <BaseButton
                    color="success"
                    :icon="mdiCheckCircle"
                    @click="approveRequest(request)"
                    :disabled="loadingStates[request.id]"
                    :label="loadingStates[request.id] ? 'Aprobando...' : 'Aprobar'"
                  />
                  <BaseButton
                    color="danger"
                    :icon="mdiCloseCircle"
                    @click="rejectRequest(request)"
                    :disabled="loadingStates[request.id]"
                    :label="loadingStates[request.id] ? 'Rechazando...' : 'Rechazar'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
