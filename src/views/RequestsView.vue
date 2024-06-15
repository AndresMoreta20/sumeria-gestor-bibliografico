<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase' // Ensure this points to your Firebase configuration file
import { mdiBook } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import TableRequests from '@/components/TableRequests.vue'

const requests = ref([]);

const fetchRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'bookRequests'));
    requests.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching requests:', error);
  }
}

onMounted(fetchRequests);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Solicitudes" main>
      </SectionTitleLineWithButton>
      
      <CardBox class="mb-6" has-table>
        <TableRequests :requests="requests" />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
