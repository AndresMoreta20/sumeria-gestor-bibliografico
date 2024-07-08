<template>
    <div class="flex flex-row space-y-2">
      <button @click="$emit('approve')" :disabled="disabled" class="p-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50" :class="buttonClass('green')">
        <BaseIcon :path="mdiCheckCircle" size="18" />
      </button>
      <button @click="$emit('edit')" :disabled="disabled" class="p-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50" :class="buttonClass('yellow')">
        <BaseIcon :path="mdiPencil" size="18" />
      </button>
      <button @click="$emit('reject')" :disabled="disabled" class="p-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50" :class="buttonClass('red')">
        <BaseIcon :path="mdiCloseCircle" size="18" />
      </button>
    </div>
  </template>
  
  <script setup>
  import { mdiCheckCircle, mdiPencil, mdiCloseCircle } from "@mdi/js";
  import BaseIcon from "@/components/BaseIcon.vue";
  
  const props = defineProps({
    disabled: Boolean
  });
  
  defineEmits(['approve', 'edit', 'reject']);
  
  const buttonClass = (color) => {
    return {
      [`bg-${color}-500`]: !props.disabled,
      [`hover:bg-${color}-600`]: !props.disabled,
      [`focus:ring-${color}-500`]: !props.disabled,
      'bg-gray-300': props.disabled,
      'cursor-not-allowed': props.disabled
    }
  };
  </script>