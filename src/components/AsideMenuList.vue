<script setup>
import AsideMenuItem from '@/components/AsideMenuItem.vue'

defineProps({
  isDropdownList: Boolean,
  menu: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['menu-click'])

const menuClick = (event, item) => {
  emit('menu-click', event, item)
}
</script>

<template>
  <ul>
    <li v-for="(item, index) in menu" :key="index">
      <template v-if="item.header">
        <h3 class="text-gray-500 px-6 py-3 uppercase text-sm font-semibold">{{ item.header }}</h3>
      </template>
      <template v-else>
        <AsideMenuItem
          :item="item"
          :is-dropdown-list="isDropdownList"
          @menu-click="menuClick"
        />
      </template>
    </li>
  </ul>
</template>
