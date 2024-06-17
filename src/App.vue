<template>
  <div id="app">
    <AppLayout>
      <router-view v-if="isAuthenticated" />
      <div v-else>
        <router-link to="/login">Login</router-link>
      </div>
    </AppLayout>
  </div>
</template>

<script setup>
import { isAuthenticated } from "@/services/auth.js";
</script>

<style>
/* Your styles here */
</style>
