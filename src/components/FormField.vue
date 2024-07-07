<script setup>
import { computed, useSlots } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: null,
  },
  labelFor: {
    type: String,
    default: null,
  },
  help: {
    type: String,
    default: null,
  },
  error: {
    type: String,
    default: null,
  },
});

const slots = useSlots();

const wrapperClass = computed(() => {
  const base = [];
  const slotsLength = slots.default().length;

  if (slotsLength > 1) {
    base.push("grid grid-cols-1 gap-3");
  }

  if (slotsLength === 2) {
    base.push("md:grid-cols-2");
  }

  return base;
});

const labelClass = computed(() => {
  const base = ['block font-bold mb-2'];
  if (props.error) {
    base.push('text-red-600');
  }
  return base.join(' ');
});

const helpClass = computed(() => {
  return props.error ? 'text-xs text-red-600 mt-1' : 'text-xs text-gray-500 dark:text-slate-400 mt-1';
});
</script>

<template>
  <div class="mb-6 last:mb-0">
    <label v-if="label" :for="labelFor" :class="labelClass">{{ label }}</label>
    <div :class="wrapperClass">
      <slot />
    </div>
    <div v-if="help || error" :class="helpClass">
      {{ error || help }}
    </div>
  </div>
</template>
