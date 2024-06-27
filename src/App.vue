<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { useMainStore } from "@/stores/main.js";

// Obtén el estado de autenticación desde el store
const mainStore = useMainStore();
const isAuthenticated = mainStore.isAuthenticated;
</script>

<style>
/* Your styles here */
</style>
