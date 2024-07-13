<!-- AuthorView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import DataTableView from '@/components/DataTableView.vue'
import { mdiAccount } from '@mdi/js'
import { fetchAuthors, updateAuthor } from '@/api/woocommerce'

const title = 'Authors'
const columns = ['id', 'name', 'actions']
const columnLabels = { id: 'ID', name: 'Nombre', actions: 'Acciones' }
const icon = mdiAccount
const checkable = false

const transformData = (data) => {
  return data.map(item => ({
    id: item.id,
    name: item.name
  }))
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

const handleUpdateAuthor = async (id, updatedData) => {
  try {
    const response = await updateAuthor(id, updatedData)
    return response
  } catch (error) {
    console.error('Error updating author:', error)
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
    :updateFunction="handleUpdateAuthor"
    new-route="authorForm"
  />
</template>