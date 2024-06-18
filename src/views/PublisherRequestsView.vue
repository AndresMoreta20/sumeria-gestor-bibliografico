<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { mdiEye, mdiDelete } from '@mdi/js';
import { useRouter } from 'vue-router';
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';

const requests = ref([]);
const loading = ref(true);
const loadingStates = ref({});
const router = useRouter();

const fetchRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'newPublisherRequest'));
    requests.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  } catch (error) {
    console.error('Error fetching requests:', error);
    loading.value = false;
  }
};

const viewRequest = (requestId) => {
  router.push({ name: 'PublisherCheckView', params: { id: requestId } });
};

const deleteRequest = async (requestId) => {
  try {
    loadingStates.value[requestId] = true;
    await deleteDoc(doc(db, 'newPublisherRequest', requestId));
    fetchRequests();
  } catch (error) {
    console.error('Error deleting request:', error);
  } finally {
    loadingStates.value[requestId] = false;
  }
};

onMounted(fetchRequests);
</script>


<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Solicitudes de Editoriales" main />
      
      <CardBox class="mb-6" has-table>
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-5 h-5 animate-spin"></div>
        </div>
        <div v-else>
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-3 border-b border-gray-300">Nombre</th>
                <th class="py-2 px-3 border-b border-gray-300">RUC</th>
                <th class="py-2 px-3 border-b border-gray-300">Correo</th>
                <th class="py-2 px-3 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td class="py-2 px-3 border-b border-gray-300">{{ request.razonSocial }}</td>
                <td class="py-2 px-3 border-b border-gray-300">{{ request.ruc }}</td>
                <td class="py-2 px-3 border-b border-gray-300">{{ request.email }}</td>
                <td class="py-2 px-3 border-b border-gray-300 flex space-x-2">
                  <button 
                    @click="viewRequest(request.id)" 
                    class="bg-blue-500 text-white px-2 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                  >
                    <span class="mdi mdi-eye"></span>
                  </button>
                  <button 
                    @click="deleteRequest(request.id)" 
                    class="bg-red-500 text-white px-2 py-2 rounded-full shadow hover:bg-red-600 transition duration-300 flex items-center justify-center"
                    :disabled="loadingStates[request.id]"
                  >
                    <span class="mdi mdi-delete"></span>
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
