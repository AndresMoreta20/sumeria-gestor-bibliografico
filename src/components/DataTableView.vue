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
    required: true
  },
  updateFunction: {
    type: Function,
    required: true
  },
  newRoute: {
    type: String,
    required: false
  }
})

const data = ref([])
const loading = ref(true)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    data.value = await props.dataFetchFunction()
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Error fetching data. Please try again later.'
  } finally {
    loading.value = false
  }
}

const handleItemUpdated = async (updatedItem) => {
  const index = data.value.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    data.value[index] = updatedItem
  }
}

onMounted(fetchData)
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="icon" :title="title" main>
        <!-- Optional button can go here if needed -->
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <template v-if="loading">
          <LoadingIndicator />
        </template>
        <template v-else-if="error">
          <div class="text-red-500">{{ error }}</div>
        </template>
        <template v-else>
          <TableGeneric 
            :items="data" 
            :columns="columns" 
            :column-labels="columnLabels" 
            :checkable="checkable"
            :update-function="updateFunction"
            :new-route="newRoute"
            @item-updated="handleItemUpdated"
          />
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>