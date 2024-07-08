<template>
  <div class="border rounded-lg p-4 flex items-start" :class="{ 'border-green-500': approved }">
    <div class="flex-grow">
      <label class="block font-bold text-sm mb-1">{{ label }}</label>
      <input 
        v-if="type !== 'textarea'" 
        :type="type" 
        :value="value" 
        @input="$emit('update:value', $event.target.value)" 
        :disabled="disabled" 
        class="border rounded px-3 py-2 w-full bg-gray-50" 
        readonly
      />
      <textarea 
        v-else 
        :value="value" 
        @input="$emit('update:value', $event.target.value)" 
        :disabled="disabled" 
        class="border rounded px-3 py-2 w-full bg-gray-50" 
        readonly
        rows="3"
      ></textarea>
      <div v-if="error" class="text-red-500 mt-1 text-sm">{{ error }}</div>
    </div>
    <div class="ml-4 flex flex-row justify-center h-full">
      <ActionButtons 
        @approve="$emit('approve')" 
        @edit="$emit('edit')" 
        @reject="$emit('reject')"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import ActionButtons from "@/components/ActionButtons.vue";

const props = defineProps({
  label: String,
  value: [String, Number],
  type: {
    type: String,
    default: 'text'
  },
  error: String,
  disabled: Boolean,
  approved: Boolean,
});

const emits = defineEmits(['update:value', 'approve', 'edit', 'reject']);
</script>