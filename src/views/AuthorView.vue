<!-- AuthorView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import DataTableView from '@/components/DataTableView.vue'
import { mdiAccount } from '@mdi/js'
import { fetchAuthors } from '@/api/woocommerce'

const title = 'Authors'
const columns = ['id', 'name']
const columnLabels = { id: 'ID', name: 'Nombre' }
const icon = mdiAccount
const checkable = false

const transformData = (data) => {
  return data.map(item => {
    return {
      id: item.id,
      name: item.name
    }
  })
}

const dataFetchFunction = async () => {
  try {
    const { data } = await fetchAuthors()
    return transformData(data)
  } catch (error) {
    console.error('Error fetching authors:', error)
    throw error
  }
}
</script>

<template>
  <DataTableView
    :title="title"
    :columns="columns"
    :column-labels="columnLabels"
    :icon="icon"
    :checkable="checkable"
    :dataFetchFunction="dataFetchFunction"
    new-route="authorForm"
  />
</template>
