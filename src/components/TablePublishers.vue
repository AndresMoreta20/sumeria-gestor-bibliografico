<script setup>
import { defineProps } from "vue";
import { mdiEye, mdiTrashCan } from "@mdi/js";
import BaseButton from "@/components/BaseButton.vue";
import { useRouter } from 'vue-router'

const router = useRouter()

const goToNewPublisher = () => {
  router.push({ name: 'publisherForm' })
}

const props = defineProps({
  publishers: {
    type: Array,
    required: true,
  },
});

const handleEdit = (publisher) => {
  console.log("Edit publisher:", publisher);
};

const handleDelete = (publisher) => {
  console.log("Delete publisher:", publisher);
};
</script>

<template>
  <button
    @click="goToNewPublisher"
    class="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300 flex items-center"
  >
    <span class="mdi mdi-plus mr-2"></span>Nueva Editorial
  </button>
  <table class="min-w-full bg-white">
    <thead>
      <tr>
        <th class="py-2 px-3 border-b border-gray-300">Name</th>
        <th class="py-2 px-3 border-b border-gray-300">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="publisher in publishers" :key="publisher.id">
        <td class="py-2 px-3 border-b border-gray-300">{{ publisher.name }}</td>
        <td class="py-2 px-3 border-b border-gray-300 flex space-x-2">
          <BaseButton
            color="info"
            :icon="mdiEye"
            small
            @click="handleEdit(publisher)"
          />
          <BaseButton
            color="danger"
            :icon="mdiTrashCan"
            small
            @click="handleDelete(publisher)"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  text-align: left;
  padding: 8px;
}
</style>
