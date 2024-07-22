<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="colorsBgLight">
      <div class="flex flex-wrap items-center justify-center w-full h-full p-6 colorsBgLight">
        <CardBox :class="`w-full lg:w-1/2 ${cardClass}`" is-form @submit.prevent="submit">
          <img src="@/assets/sumeria_logo.png" alt="Business Logo" class="w-32 mx-auto my-4" /><br />
          <FormField label="Correo" help="Correo">
            <FormControl
              v-model="form.login"
              :icon="mdiAccount"
              name="login"
              autocomplete="email"
              required
              aria-label="Correo"
            />
          </FormField>

          <FormField label="Password" help="Contraseña">
            <FormControl
              v-model="form.pass"
              :icon="mdiAsterisk"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              aria-label="Contraseña"
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton
                type="submit"
                color="bg-black text-white"
                :label="isLoading ? 'Cargando...' : 'Login'"
                class="w-full"
                :disabled="isLoading"
              />
            </BaseButtons>
            <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
            <p class="mt-4 text-center">
  <router-link to="/password-reset" class="text-blue-500">¿Olvidaste tu contraseña?</router-link>
</p>
            <p class="mt-4 text-center">
              ¿Quieres publicar con nosotros?
              <router-link to="/publisher-form" class="text-blue-500">Haz clic aquí</router-link>
            </p>
          </template>
        </CardBox>
        <div class="hidden lg:block w-full lg:w-1/2 text-center p-6">
          <img src="@/assets/sumeria_promo_image-transparent.png" alt="Promotional Image" class="w-84 mx-auto my-4" />
        </div>
      </div>
    </SectionFullScreen>
  </LayoutGuest>
</template>

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
  login: "",
  pass: "",
  remember: true,
});

const router = useRouter();
const mainStore = useMainStore();
const errorMessage = ref("");
const isLoading = ref(false);

const validateForm = () => {
  if (form.login === '' || form.pass === '') {
    errorMessage.value = 'Correo y contraseña son requeridos.';
    return false;
  }
  return true;
};

const submit = async () => {
  if (validateForm()) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      await mainStore.handleLogin(form.login, form.pass);
      router.push("/books");
    } catch (error) {
      console.error("Error durante el login:", error);
      errorMessage.value = error.message || "Falló el inicio de sesión.";
    } finally {
      isLoading.value = false;
    }
  }
};
</script>

<style scoped>
/* Tailwind classes handle most of the styling, additional styles if needed can be added here */
</style>
