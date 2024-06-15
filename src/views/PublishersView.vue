<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import TablePublishers from '@/components/TablePublishers.vue'

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET

const publishers = ref([])

const fetchPublishers = async () => {
  try {
    const response = await axios.get('https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/4/terms', {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    })
    publishers.value = response.data
  } catch (error) {
    console.error('Error fetching publishers:', error)
  }
}

onMounted(fetchPublishers)
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
