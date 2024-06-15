<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import TableLanguages from '@/components/TableLanguages.vue'

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET

const languages = ref([])

const fetchLanguages = async () => {
  try {
    const response = await axios.get('https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/7/terms', {
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    })
    languages.value = response.data
  } catch (error) {
    console.error('Error fetching languages:', error)
  }
}

onMounted(fetchLanguages)
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton title="Languages" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>
      
      <CardBox class="mb-6" has-table>
        <TableLanguages :languages="languages" />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
