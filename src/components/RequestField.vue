<template>
  <div 
    class="border rounded-lg p-4 flex items-center" 
    :class="borderClass"
  >
    <div class="flex-grow">
      <label class="block font-bold text-sm mb-1">{{ label }}</label>

      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        :type="type !== 'textarea' ? type : undefined"
        :value="value"
        @input="handleInput"
        :disabled="disabled"
        class="border rounded px-3 py-2 w-full bg-gray-50"
        :rows="type === 'textarea' ? 3 : undefined"
      />
      <div v-if="error" class="text-red-500 mt-1 text-sm">{{ error }}</div>
    </div>
    <div class="ml-4 flex flex-row space-x-2 h-full">
      <button 
        @click="approve"
        :class="approveButtonClass"
      >
        <BaseIcon :path="mdiCheckCircle" size="18" />
      </button>
      <button 
        @click="reject"
        :class="rejectButtonClass"
      >
        <BaseIcon :path="mdiCloseCircle" size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue';
import BaseIcon from "@/components/BaseIcon.vue";
import { mdiCheckCircle, mdiCloseCircle } from "@mdi/js";

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
  rejected: Boolean,
});

const emit = defineEmits(['approve', 'reject', 'update:value']);

const isApproved = ref(props.approved);
const isRejected = ref(props.rejected);

watchEffect(() => {
  isApproved.value = props.approved;
  isRejected.value = props.rejected;
});

const borderClass = computed(() => {
  if (isApproved.value) return 'border-green-500';
  if (isRejected.value) return 'border-red-500';
  return 'border-gray-300';
});

const approveButtonClass = computed(() => ({
  'bg-green-500 hover:bg-green-600 focus:ring-green-500': isApproved.value,
  'bg-gray-300 hover:bg-gray-400 focus:ring-gray-300': !isApproved.value,
  'text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-opacity-50': true,
}));

const rejectButtonClass = computed(() => ({
  'bg-red-500 hover:bg-red-600 focus:ring-red-500': isRejected.value,
  'bg-gray-300 hover:bg-gray-400 focus:ring-gray-300': !isRejected.value,
  'text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-opacity-50': true,
}));

const handleInput = (event) => {
  emit('update:value', event.target.value);
};

const approve = () => {
  if (!isApproved.value) {
    isApproved.value = true;
    isRejected.value = false;
    emit('approve');
  }
};

const reject = () => {
  if (!isRejected.value) {
    isApproved.value = false;
    isRejected.value = true;
    emit('reject');
  }
};
</script>
