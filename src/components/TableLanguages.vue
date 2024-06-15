<script setup>
import { defineProps } from "vue";
import { mdiEye, mdiTrashCan } from "@mdi/js";
import BaseButton from "@/components/BaseButton.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goToNewLanguage = () => {
  router.push({ name: "languageForm" });
};

const props = defineProps({
  languages: {
    type: Array,
    required: true,
  },
});

const handleEdit = (language) => {
  console.log("Edit language:", language);
};

const handleDelete = (language) => {
  console.log("Delete language:", language);
};
</script>

<template>
  <button
    @click="goToNewLanguage"
    class="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300 flex items-center"
  >
    <span class="mdi mdi-plus mr-2"></span>Nuevo Lenguaje
  </button>
  <table class="min-w-full bg-white">
    <thead>
      <tr>
        <th class="py-2 px-3 border-b border-gray-300">Name</th>
        <th class="py-2 px-3 border-b border-gray-300">Description</th>
        <th class="py-2 px-3 border-b border-gray-300">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="language in languages" :key="language.id">
        <td class="py-2 px-3 border-b border-gray-300">{{ language.name }}</td>
        <td class="py-2 px-3 border-b border-gray-300">
          {{ language.description }}
        </td>
        <td class="py-2 px-3 border-b border-gray-300 flex space-x-2">
          <BaseButton
            color="info"
            :icon="mdiEye"
            small
            @click="handleEdit(language)"
          />
          <BaseButton
            color="danger"
            :icon="mdiTrashCan"
            small
            @click="handleDelete(language)"
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
