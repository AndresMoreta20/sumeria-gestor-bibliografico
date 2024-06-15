<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase'; // Ensure this points to your Firebase configuration file
import axios from 'axios';
import { mdiBook } from '@mdi/js';
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const requests = ref([]);
const loading = ref(true);
const loadingStates = ref({});

const fetchRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'bookRequests'));
    requests.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  } catch (error) {
    console.error('Error fetching requests:', error);
    loading.value = false;
  }
};

const approveRequest = async (request) => {
  try {
    loadingStates.value[request.id] = true;

    const data = {
      name: request.title,
      type: 'simple',
      regular_price: request.regularPrice,
      sale_price: request.salePrice,
      sku: request.sku,
      stock_quantity: request.stockQuantity,
      manage_stock: true,
      description: request.description,
      short_description: request.shortDescription,
      categories: [{ id: request.category }],
      images: [{ src: request.imageUrl }],
      attributes: [
        { id: 1, name: 'Autor', options: [request.author] },
        { id: 3, name: 'ISBN', options: [request.isbn] },
        { id: 4, name: 'Editorial', options: [request.publisher] },
        { id: 2, name: 'Formato', options: [request.format] },
        { id: 7, name: 'Idioma', options: [request.language] },
        { id: 6, name: 'Encuadernación', options: ['Tapa blanda'] },
        { id: 5, name: 'Estado', options: ['Nuevo'] }
      ],
      downloads: [
        { name: 'Digital Book', file: request.fileUrl }
      ]
    };

    const response = await axios.post('https://cindyl23.sg-host.com/wp-json/wc/v3/products', data, {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    });

    console.log('Book uploaded successfully:', response.data);
    alert('Book uploaded successfully');

    // Remove request from Firestore after approval
    await deleteDoc(doc(db, 'bookRequests', request.id));
    fetchRequests();
  } catch (error) {
    console.error('Error approving request:', error);
    alert('Error approving request');
  } finally {
    loadingStates.value[request.id] = false;
  }
};

onMounted(fetchRequests);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Solicitudes de Libros" main />
      
      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div class="loader"></div>
        </div>
        <div v-else>
          <table class="table-auto w-full">
            <thead>
              <tr>
                <th class="px-4 py-2">Title</th>
                <th class="px-4 py-2">Author</th>
                <th class="px-4 py-2">Category</th>
                <th class="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td class="border px-4 py-2">{{ request.title }}</td>
                <td class="border px-4 py-2">{{ request.author }}</td>
                <td class="border px-4 py-2">{{ request.category }}</td>
                <td class="border px-4 py-2">
                  <button 
                    @click="approveRequest(request)" 
                    class="bg-green-500 text-white px-4 py-2 rounded"
                    :disabled="loadingStates[request.id]"
                  >
                    <span v-if="loadingStates[request.id]" class="loader"></span>
                    <span v-else>Approve</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.loader {
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 2s linear infinite;
  display: inline-block;
  margin-right: 5px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
