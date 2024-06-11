<script setup>
import { computed, ref, onMounted } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiCheckDecagram } from '@mdi/js'
import BaseLevel from '@/components/BaseLevel.vue'
import UserAvatarCurrentUser from '@/components/UserAvatarCurrentUser.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadio from '@/components/FormCheckRadio.vue'
import PillTag from '@/components/PillTag.vue'

const mainStore = useMainStore()

const userName = computed(() => mainStore.userName)
const userEmail = computed(() => mainStore.userEmail)
const userAvatar = computed(() => mainStore.userAvatar)

const userSwitchVal = ref(false)

// Fetch user info if not already fetched
onMounted(() => {
  if (!mainStore.userName) {
    mainStore.fetchUserInfo()
  }
})
</script>

<template>
  <CardBox>
    <BaseLevel type="justify-around lg:justify-center">
      <UserAvatarCurrentUser :src="userAvatar" class="lg:mx-12" />
      <div class="space-y-3 text-center md:text-left lg:mx-12">
        <div class="flex justify-center md:block">
          <FormCheckRadio
            v-model="userSwitchVal"
            name="notifications-switch"
            type="switch"
            label="Notificaciones"
            :input-value="true"
          />
        </div>
        <h1 class="text-2xl">
          Bienvenido <b>{{ userName }}</b
          >
        </h1>
        <!-- <p>Last login <b>12 mins ago</b> from <b>127.0.0.1</b></p> -->
        <div class="flex justify-center md:block">
          <!-- <PillTag label="Verified" color="info" :icon="mdiCheckDecagram" /> -->
        </div>
      </div>
    </BaseLevel>
  </CardBox>
</template>
