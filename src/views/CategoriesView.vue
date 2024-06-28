<script setup>
import DataTableView from '@/components/DataTableView.vue'
import { mdiHeart } from '@mdi/js'

const endpoint = 'https://cindyl23.sg-host.com/wp-json/wc/v3/products/categories'
const title = 'Categorías'
const columns = ['id', 'name', 'slug', 'parent', 'description']
const icon = mdiHeart
const checkable = false
</script>

<template>
  <DataTableView :endpoint="endpoint" :title="title" :columns="columns" :icon="icon" :checkable="checkable" />
</template>
