<!-- DataTableView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SectionMain from '@/components/SectionMain.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import TableGeneric from '@/components/TableGeneric.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'

const props = defineProps({
  endpoint: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  columnLabels: {
    type: Object,
    required: false,
    default: () => ({})
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
  },
  dataTransform: {
    type: Function,
    required: false
  },
  newRoute: {
    type: String,
    required: false
  },
  updateLanguage: { // Declarar la prop updateLanguage
    type: Function,
    required: true
  }
})

const data = ref([])
const loading = ref(true)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    if (props.dataFetchFunction) {
      data.value = await props.dataFetchFunction()
    } else if (props.endpoint) {
      const response = await axios.get(props.endpoint, {
        auth: {
          username: import.meta.env.VITE_APP_CONSUMER_KEY,
          password: import.meta.env.VITE_APP_CONSUMER_SECRET
        }
      })
      data.value = response.data
    }
    if (props.dataTransform) {
      data.value = props.dataTransform(data.value)
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Error fetching data. Please try again later.'
  } finally {
    loading.value = false
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
          <LoadingIndicator />
        </template>
        <template v-else-if="error">
          <div class="text-red-500">{{ error }}</div> <!-- Mostrar mensaje de error -->
        </template>
        <template v-else>
          <TableGeneric
            :items="data"
            :columns="columns"
            :column-labels="columnLabels"
            :checkable="checkable"
            :newRoute="newRoute"
            :updateLanguage="props.updateLanguage" 
          />
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
