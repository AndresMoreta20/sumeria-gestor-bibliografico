<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOpenPageVariant"
        title="Revisión de Solicitud de Editorial"
        main
      />

      <CardBox class="max-w-4xl mx-auto">
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></div>
        </div>
        <div v-else-if="submitError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">Error!</strong>
          <span>{{ submitError }}</span>
        </div>
        <div v-else class="space-y-4">
          <div v-for="(value, key) in formFields" :key="key" class="border rounded-lg p-4">
            <label class="block font-bold text-sm mb-1">{{ fieldLabels[key] }}</label>
            <component
              :is="key.includes('description') ? 'textarea' : 'input'"
              :type="key.includes('description') ? undefined : 'text'"
              :value="value"
              disabled
              class="border rounded px-3 py-2 w-full bg-gray-50"
              :rows="key.includes('description') ? 3 : undefined"
            />
          </div>

          <BaseDivider class="my-6" />

          <div class="flex justify-end space-x-2">
            <BaseButton
              color="success"
              :icon="mdiCheckCircle"
              @click="approveRequest"
              :disabled="loading"
              label="Aprobar y crear cuenta"
            />
            <BaseButton
              color="danger"
              :icon="mdiCloseCircle"
              @click="openRejectModal"
              :disabled="loading"
              label="Rechazar solicitud"
            />
          </div>
        </div>
      </CardBox>

      <CardBoxModal
        v-model="isRejectModalOpen"
        title="Rechazar Solicitud"
        button="danger"
        buttonLabel="Enviar"
        :hasCancel="true"
        @confirm="handleRejectConfirm"
      >
        <textarea v-model="rejectionReason" class="border rounded px-3 py-2 w-full" rows="5" placeholder="Ingrese las observaciones..."></textarea>
      </CardBoxModal>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiBookOpenPageVariant, mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/firebase";
import emailjs from "@emailjs/browser";
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseDivider from '@/components/BaseDivider.vue';
import CardBoxModal from '@/components/CardBoxModal.vue';

const route = useRoute();
const router = useRouter();
const requestId = route.params.id;

const form = reactive({});
const originalForm = reactive({});
const loading = ref(false);
const submitError = ref(null);
const isRejectModalOpen = ref(false);
const rejectionReason = ref('');

const fieldLabels = {
  razonSocial: 'Nombre',
  ruc: 'RUC',
  email: 'Correo',
  direccion: 'Dirección',
  ciudad: 'Ciudad',
  departamento: 'Provincia',
  telefono: 'Teléfono',
  paginaWeb: 'Página web',
};

const formFields = computed(() => {
  return Object.keys(fieldLabels).reduce((acc, key) => {
    acc[key] = form[key];
    return acc;
  }, {});
});

onMounted(async () => {
  loading.value = true;
  try {
    const docRef = doc(db, "newPublisherRequest", requestId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      Object.assign(form, data);
      Object.assign(originalForm, data);
    } else {
      submitError.value = 'No se encontró la solicitud.';
    }
  } catch (error) {
    submitError.value = 'Error fetching request data';
  } finally {
    loading.value = false;
  }

  window.addEventListener('beforeunload', handleBeforeUnload);
});

const handleBeforeUnload = (event) => {
  event.preventDefault();
  event.returnValue = '';
};

const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  do {
    password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()]/.test(password));
  return password;
};

const sendEmailNotification = async (email, subject, message) => {
  const templateParams = {
    to_email: email,
    subject: subject,
    message: message,
  };

  try {
    const result = await Promise.race([
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timed out')), 10000)
      )
    ]);
    
    console.log("Correo enviado correctamente");
    return { success: true, result };
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const approveRequest = async () => {
  loading.value = true;
  submitError.value = null;

  try {
    const auth = getAuth();
    const password = generatePassword();

    const userCredential = await createUserWithEmailAndPassword(auth, form.email, password);
    const user = userCredential.user;

    const subject = "Bienvenido a Nuestra Plataforma";
    const message = `Hola ${form.razonSocial},
                     Bienvenido a nuestra plataforma. Su cuenta ha sido creada exitosamente.
                     Email: ${form.email}
                     Contraseña: ${password}
                    `;

    await sendEmailNotification(form.email, subject, message);

    await setDoc(doc(db, "publishers", user.uid), {
      email: form.email,
      razonSocial: form.razonSocial,
      ruc: form.ruc,
      direccion: form.direccion,
      ciudad: form.ciudad,
      departamento: form.departamento,
      telefono: form.telefono,
      paginaWeb: form.paginaWeb,
      needsPasswordChange:true,
      createdAt: new Date(),
    });

    await deleteDoc(doc(db, "newPublisherRequest", requestId));
    router.push("/publisher-requests");
  } catch (error) {
    console.error('Error approving request:', error);
    submitError.value = 'Error creating publisher account: ' + (error.response?.data?.message || error.message);
  } finally {
    loading.value = false;
  }
};

const openRejectModal = () => {
  isRejectModalOpen.value = true;
};

const handleRejectConfirm = async () => {
  loading.value = true;
  submitError.value = null;

  try {
    const subject = "Solicitud Rechazada";
    const message = `Hola ${form.razonSocial},
                     Lamentamos informarle que su solicitud ha sido rechazada por las siguientes razones:
                     Observaciones: ${rejectionReason.value}
                     
                     Saludos Cordiales
                     
                     Sumeria
                     `;

    await sendEmailNotification(form.email, subject, message);

    await setDoc(doc(db, "declinedPublisherRequest", requestId), {
      ...form,
      rejectionReason: rejectionReason.value,
    });
    await deleteDoc(doc(db, "newPublisherRequest", requestId));

    router.push("/publisher-requests");
  } catch (error) {
    console.error('Error rejecting request:', error);
    submitError.value = 'Error rejecting request';
  } finally {
    loading.value = false;
    isRejectModalOpen.value = false;
  }
};
</script>

<style scoped>
.loader {
  border-top-color: #3490dc;
}
</style>
