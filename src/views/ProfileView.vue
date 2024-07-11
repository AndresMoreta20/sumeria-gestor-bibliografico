<script setup>
import { reactive, onMounted } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiAsterisk, mdiFormTextboxPassword } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const mainStore = useMainStore()

const profileForm = reactive({
  ciudad: '',
  createdAt: '',
  departamento: '',
  direccion: '',
  email: '',
  paginaWeb: '',
  razonSocial: '',
  ruc: '',
  telefono: ''
})

const fetchProfileData = async () => {
  const userToken = sessionStorage.getItem('user-token');
  if (!userToken) {
    alert('User token is not available');
    return;
  }

  try {
    const docRef = doc(db, "publishers", userToken);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Document data:", data); // Log the document data
      profileForm.ciudad = data.ciudad || '';
      profileForm.createdAt = data.createdAt || '';
      profileForm.departamento = data.departamento || '';
      profileForm.direccion = data.direccion || '';
      profileForm.email = data.email || '';
      profileForm.paginaWeb = data.paginaWeb || '';
      profileForm.razonSocial = data.razonSocial || '';
      profileForm.ruc = data.ruc || '';
      profileForm.telefono = data.telefono || '';
    } else {
      console.error("No such document!");
      // Optionally, create the document if it does not exist
      await setDoc(docRef, {
        ciudad: '',
        createdAt: new Date().toISOString(),
        departamento: '',
        direccion: '',
        email: '', // This can be set if you have it
        paginaWeb: '',
        razonSocial: '',
        ruc: '',
        telefono: ''
      });
      console.log("Document created with default values.");
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
  }
}

const submitProfile = async () => {
  const userToken = sessionStorage.getItem('user-token');
  if (!userToken) {
    alert('User token is not available');
    return;
  }

  try {
    const docRef = doc(db, "publishers", userToken);
    await updateDoc(docRef, {
      ciudad: profileForm.ciudad,
      createdAt: profileForm.createdAt,
      departamento: profileForm.departamento,
      direccion: profileForm.direccion,
      email: profileForm.email,
      paginaWeb: profileForm.paginaWeb,
      razonSocial: profileForm.razonSocial,
      ruc: profileForm.ruc,
      telefono: profileForm.telefono
    });
    alert('Profile updated successfully');
  } catch (error) {
    console.error("Error updating profile:", error);
    alert(`There was an error updating the profile: ${error.message}`);
  }
}

onMounted(() => {
  fetchProfileData();
});
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <div class="flex justify-center items-center min-h-screen">
        <CardBox is-form @submit.prevent="submitProfile" class="w-full max-w-lg mx-auto">
          <FormField label="Ciudad" help="Required. Your city">
            <FormControl
              v-model="profileForm.ciudad"
              :icon="mdiAsterisk"
              name="ciudad"
              type="text"
              required
            />
          </FormField>

          <FormField label="Departamento" help="Required. Your department">
            <FormControl
              v-model="profileForm.departamento"
              :icon="mdiAsterisk"
              name="departamento"
              type="text"
              required
            />
          </FormField>

          <FormField label="Direccion" help="Required. Your address">
            <FormControl
              v-model="profileForm.direccion"
              :icon="mdiAsterisk"
              name="direccion"
              type="text"
              required
            />
          </FormField>

          <FormField label="Email" help="Required. Your email">
            <FormControl
              v-model="profileForm.email"
              :icon="mdiAsterisk"
              name="email"
              type="email"
              required
            />
          </FormField>

          <FormField label="Pagina Web" help="Optional. Your website">
            <FormControl
              v-model="profileForm.paginaWeb"
              name="paginaWeb"
              type="url"
            />
          </FormField>

          <FormField label="Razon Social" help="Required. Your business name">
            <FormControl
              v-model="profileForm.razonSocial"
              :icon="mdiAsterisk"
              name="razonSocial"
              type="text"
              required
            />
          </FormField>

          <FormField label="RUC" help="Required. Your RUC number">
            <FormControl
              v-model="profileForm.ruc"
              :icon="mdiAsterisk"
              name="ruc"
              type="text"
              required
            />
          </FormField>

          <FormField label="Telefono" help="Required. Your phone number">
            <FormControl
              v-model="profileForm.telefono"
              :icon="mdiAsterisk"
              name="telefono"
              type="tel"
              required
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton type="submit" color="info" label="Submit" />
              <BaseButton color="info" label="Cancel" outline />
            </BaseButtons>
          </template>
        </CardBox>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
