<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { mdiAccount, mdiAsterisk } from "@mdi/js";
import SectionFullScreen from "@/components/SectionFullScreen.vue";
import CardBox from "@/components/CardBox.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import LayoutGuest from "@/layouts/LayoutGuest.vue";
import { useMainStore } from "@/stores/main.js";

const form = reactive({
  login: "kevin.cardenas-1@hotmail.com",
  pass: "admin",
  remember: true,
});

const router = useRouter();
const mainStore = useMainStore();
const errorMessage = ref("");

const submit = async () => {
  try {
    await mainStore.handleLogin(form.login, form.pass);
    router.push("/dashboard");
  } catch (error) {
    console.error("Error durante el login:", error);
    errorMessage.value = error.message || "Login failed";
  }
};
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="colorsBgLight">
      <div
        class="flex flex-wrap items-center justify-center w-full h-full p-6 bg-white"
      >
        <CardBox
          :class="`w-full lg:w-1/2 ${cardClass}`"
          is-form
          @submit.prevent="submit"
        >
          <img
            src="../assets/sumeria_logo.png"
            alt="Business Logo"
            class="w-32 mx-auto my-4"
          /><br />
          <FormField label="Correo" help="Correo">
            <FormControl
              v-model="form.login"
              :icon="mdiAccount"
              name="login"
              autocomplete="email"
            />
          </FormField>

          <FormField label="Password" help="Contraseña">
            <FormControl
              v-model="form.pass"
              :icon="mdiAsterisk"
              type="password"
              name="password"
              autocomplete="current-password"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton
                type="submit"
                color="bg-black text-white"
                label="Login"
                class="w-full"
              />
            </BaseButtons>
            <p v-if="errorMessage" class="mt-4 text-red-500">
              {{ errorMessage }}
            </p>
            <p class="mt-4 text-center">
              Quieres publicar con nosotros?
              <router-link to="/publisher-form" class="text-blue-500"
                >Haz clic aquí</router-link
              >
            </p>
          </template>
        </CardBox>
        <div class="w-full lg:w-1/2 text-center p-6">
          <img
            src="../assets/sumeria_promo_Image.png"
            alt="Business Logo"
            class="w-84 mx-auto my-4"
          />
        </div>
      </div>
    </SectionFullScreen>
  </LayoutGuest>
</template>
