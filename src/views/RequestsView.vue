<script setup>
import { ref, onMounted } from 'vue';
import { mdiBook } from '@mdi/js';
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';
import TableRequests from '@/components/TableRequests.vue';
import { fetchRequests } from '@/api/firebase';

const requests = ref([]);

const loadRequests = async () => {
  try {
    requests.value = await fetchRequests();
  } catch (error) {
    console.error('Error fetching requests:', error);
  }
};

onMounted(loadRequests);
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
