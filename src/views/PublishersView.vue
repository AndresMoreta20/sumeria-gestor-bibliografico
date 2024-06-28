<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiTableBorder } from '@mdi/js'
import { fetchPublishers } from '@/api/woocommerce'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/attributes/2/terms'  // Asegúrate de que este sea el endpoint correcto para los editores.
const title = 'Publishers'
const columns = ['id', 'name', 'slug', 'description']
const icon = mdiTableBorder
const checkable = false

const dataFetchFunction = fetchPublishers
</script>

<template>
  <DataTableView :endpoint="endpoint" :title="title" :columns="columns" :icon="icon" :checkable="checkable" :data-fetch-function="dataFetchFunction" />
</template>
