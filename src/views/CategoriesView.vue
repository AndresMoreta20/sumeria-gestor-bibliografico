<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
//import { mdiCategory } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import TableCategories from '@/components/TableCategories.vue'

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET

const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await axios.get('https://cindyl23.sg-host.com/wp-json/wc/v3/products/categories', {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    })
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

onMounted(fetchCategories)
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiCategory" title="Categorías" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>
      
      <CardBox class="mb-6" has-table>
        <TableCategories :categories="categories" />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
