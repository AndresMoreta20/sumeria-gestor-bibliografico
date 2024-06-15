<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const router = useRouter();
const requests = ref([]);
const loading = ref(true);

const fetchRequests = async () => {
  try {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, 'bookRequests'));
    requests.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  } catch (error) {
    console.error('Error fetching requests:', error);
    loading.value = false;
  }
};

const goToNewRequest = () => {
  router.push({ name: 'requestForm' });
};

onMounted(fetchRequests);
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <div>
        <label class="mr-2">Category:</label>
        <select v-model="selectedCategory" class="border rounded p-2">
          <option value="all">All</option>
          <!-- Add options for filtering by category if needed -->
        </select>
      </div>
      <button @click="goToNewRequest" class="bg-blue-500 text-white p-2 rounded">Nueva Solicitud</button>
    </div>
    <div v-if="loading" class="flex items-center justify-center">
      <div class="loader"></div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="request in requests" :key="request.id" class="bg-white rounded-lg shadow p-4 flex flex-col items-center h-full">
        <img :src="request.imageUrl" alt="Book cover" class="h-48 w-32 object-cover mb-4">
        <h2 class="text-lg font-semibold mb-2 text-center truncate w-full">{{ request.title }}</h2>
        <p class="text-blue-500 mb-2">{{ request.regularPrice }}</p>
        <p class="text-gray-500 mb-4">{{ request.category }}</p>
        <div class="mt-auto flex justify-between w-full">
          <button class="bg-gray-300 text-black py-2 px-4 rounded w-full mr-2">Edit</button>
          <button @click="deleteRequest(request.id)" class="bg-red-500 text-white py-2 px-4 rounded w-full">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
