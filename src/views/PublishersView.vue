<script setup>
import { ref, onMounted } from 'vue';
import { fetchPublishers } from '@/api/woocommerce';
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';
import TablePublishers from '@/components/TablePublishers.vue';

const publishers = ref([]);

const loadPublishers = async () => {
  try {
    publishers.value = await fetchPublishers();
  } catch (error) {
    console.error('Error fetching publishers:', error);
  }
};

onMounted(loadPublishers);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton title="Publishers" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>
      
      <CardBox class="mb-6" has-table>
        <TablePublishers :publishers="publishers" />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
