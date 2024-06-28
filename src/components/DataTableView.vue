<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import TableGeneric from '@/components/TableGeneric.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue' // Asegúrate de tener este componente

const props = defineProps({
  endpoint: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  icon: {
    type: String,
    required: false
  },
  checkable: {
    type: Boolean,
    default: false
  },
  dataFetchFunction: {
    type: Function,
    required: false
  }
})

const data = ref([])
const loading = ref(true)

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET

const fetchData = async () => {
  loading.value = true
  if (props.dataFetchFunction) {
    try {
      data.value = await props.dataFetchFunction()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      loading.value = false
    }
  } else {
    try {
      const response = await axios.get(props.endpoint, {
        auth: {
          username: consumerKey,
          password: consumerSecret
        }
      })
      data.value = response.data
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      loading.value = false
    }
  }
}

onMounted(fetchData)
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="icon" :title="title" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <template v-if="loading">
          <LoadingIndicator /> <!-- Componente de indicador de carga -->
        </template>
        <template v-else>
          <TableGeneric :items="data" :columns="columns" :checkable="checkable" />
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
