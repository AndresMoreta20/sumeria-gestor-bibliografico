<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiTableBorder } from '@mdi/js'
import { fetchPublishers } from '@/api/woocommerce'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/2/terms'
const title = 'Publishers'
const columns = ['id', 'name']
const columnLabels = { id: 'ID', name: 'Nombre' }
const icon = mdiTableBorder
const checkable = false

const transformData = (data) => {
  return data.map(item => {
    return {
      id: item.id,
      name: item.name
    }
  })
}
</script>

<template>
  <DataTableView
    :endpoint="endpoint"
    :title="title"
    :columns="columns"
    :column-labels="columnLabels"
    :icon="icon"
    :checkable="checkable"
    :data-transform="transformData"
    new-route="PublisherForm" 
  />
</template>
