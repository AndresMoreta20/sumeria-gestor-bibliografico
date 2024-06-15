<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { mdiTableBorder, mdiGithub } from '@mdi/js';
import SectionMain from '@/components/SectionMain.vue';
import TableAuthors from '@/components/TableAuthors.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import BaseButton from '@/components/BaseButton.vue';

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const authors = ref([]);

const fetchAuthors = async () => {
  try {
    const response = await axios.get('https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/1/terms', {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    });
    authors.value = response.data;
  } catch (error) {
    console.error('Error fetching authors:', error);
  }
}

onMounted(fetchAuthors);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Authors" main>
        <!-- <BaseButton
          href="https://github.com/justboil/admin-one-vue-tailwind"
          target="_blank"
          :icon="mdiGithub"
          label="Star on GitHub"
          color="contrast"
          rounded-full
          small
        /> -->
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <TableAuthors :authors="authors" />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
