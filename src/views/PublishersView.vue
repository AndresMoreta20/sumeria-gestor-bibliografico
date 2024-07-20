<!-- PublishersView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import DataTableView from '@/components/DataTableView.vue'
import { mdiTableBorder } from '@mdi/js'
import { fetchPublishers } from '@/api/woocommerce'

const title = 'Editoriales'
const columns = ['id', 'name']
const columnLabels = { id: 'ID', name: 'Nombre' }
const icon = mdiTableBorder
const checkable = false

const transformData = (data) => {
  return data.map(item => ({
    id: item.id,
    name: item.name
  }))
}

const dataFetchFunction = async () => {
  try {
    const data = await fetchPublishers()
    return transformData(data)
  } catch (error) {
    console.error('Error fetching publishers:', error)
    throw error
  }
}
</script>

<!-- PublishersView.vue -->
<template>
  <DataTableView
    :title="title"
    :columns="columns"
    :column-labels="columnLabels"
    :icon="icon"
    :checkable="checkable"
    :dataFetchFunction="dataFetchFunction"
    new-route="publisherForm"
    :hideEditButton=true
  />
</template>