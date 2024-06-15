<script setup>
import { defineProps, computed, ref } from 'vue'
import { mdiEye, mdiTrashCan, mdiAccount } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToNewAuthor = () => {
  router.push({ name: 'authorForm' })
}


const props = defineProps({
  authors: {
    type: Array,
    required: true
  }
})

const isModalActive = ref(false)
const isModalDangerActive = ref(false)

const perPage = ref(5)
const currentPage = ref(0)
const checkedRows = ref([])

const itemsPaginated = computed(() =>
  props.authors.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
)

const numPages = computed(() => Math.ceil(props.authors.length / perPage.value))

const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }

  return pagesList
})

const remove = (arr, cb) => {
  const newArr = []

  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item)
    }
  })

  return newArr
}

const checked = (isChecked, author) => {
  if (isChecked) {
    checkedRows.value.push(author)
  } else {
    checkedRows.value = remove(checkedRows.value, (row) => row.id === author.id)
  }
}
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBoxModal v-model="isModalDangerActive" title="Please confirm" button="danger" has-cancel>
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <div class="flex justify-end mb-4">
    <button @click="goToNewAuthor" class="bg-blue-500 text-white p-2 rounded">Nuevo Autor</button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div
      v-for="author in itemsPaginated"
      :key="author.id"
      class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center"
    >
      <div class="mb-4">
        <img
          :src="author.image || 'https://via.placeholder.com/150'"
          alt="Author photo"
          class="h-24 w-24 object-cover rounded-full"
        />
      </div>
      <h2 class="text-lg font-semibold mb-2 text-center">{{ author.name }}</h2>
      <div class="flex space-x-2 mt-auto">
        <button class="bg-gray-300 text-black py-2 px-4 rounded">Edit</button>
        <button class="bg-red-500 text-white py-2 px-4 rounded">Delete</button>
      </div>
    </div>
  </div>

  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800 mt-6">
    <div class="flex justify-between items-center">
      <div class="flex space-x-2">
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </div>
      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
