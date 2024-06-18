<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOpenPageVariant"
        title="Revisión de Solicitud de Editorial"
        main
      />

      <CardBox>
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div
            class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-10 h-10 animate-spin"
          ></div>
        </div>
        <div v-else-if="request">
          <div class="mb-4">
            <h2 class="text-2xl font-bold mb-2">Información de la Editorial</h2>
            <p>
              <strong>Nombre:</strong>
              {{ request.razonSocial || request.nombres }}
            </p>
            <p><strong>RUC:</strong> {{ request.ruc || "N/A" }}</p>
            <p><strong>Correo:</strong> {{ request.email }}</p>
            <p><strong>Dirección:</strong> {{ request.direccion || "N/A" }}</p>
            <p><strong>Ciudad:</strong> {{ request.ciudad || "N/A" }}</p>
            <p>
              <strong>Provincia:</strong> {{ request.departamento || "N/A" }}
            </p>
            <p><strong>Teléfono:</strong> {{ request.telefono || "N/A" }}</p>
            <p>
              <strong>Página web:</strong>
              <a
                :href="request.paginaWeb"
                target="_blank"
                class="text-blue-500"
                >{{ request.paginaWeb || "N/A" }}</a
              >
            </p>
          </div>
          <div class="mb-4">
            <h3 class="text-xl font-bold mb-2">Observaciones</h3>
            <textarea
              v-model="observation"
              class="w-full p-2 border rounded"
              rows="4"
              placeholder="Escribe tus observaciones aquí..."
            ></textarea>
          </div>
          <div class="flex space-x-2">
            <BaseButton
              @click="approveRequest"
              color="success"
              :disabled="sending"
              :icon="mdiCheck"
            >
              <template #loading>
                <span
                  class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-5 h-5 animate-spin"
                ></span>
              </template>
              Aprobar
            </BaseButton>
            <BaseButton
              @click="rejectRequest"
              color="danger"
              :disabled="sending"
              :icon="mdiClose"
            >
              <template #loading>
                <span
                  class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-5 h-5 animate-spin"
                ></span>
              </template>
              Rechazar
            </BaseButton>
          </div>
        </div>
        <div v-else class="text-center text-red-500">
          <p>No se encontró la solicitud.</p>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/firebase";
import emailjs from "@emailjs/browser";
import { mdiBookOpenPageVariant, mdiCheck, mdiClose } from "@mdi/js";
import BaseButton from "@/components/BaseButton.vue";
import SectionMain from "@/components/SectionMain.vue";
import CardBox from "@/components/CardBox.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";

const router = useRouter();
const route = useRoute();

const requestId = route.params.id;
const request = ref(null);
const loading = ref(true);
const observation = ref("");
const sending = ref(false);

const fetchRequest = async () => {
  try {
    if (!requestId) {
      throw new Error("requestId is not defined");
    }

    const docRef = doc(db, "newPublisherRequest", requestId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      request.value = docSnap.data();
    } else {
      console.error("No such document!");
    }
    loading.value = false;
  } catch (error) {
    console.error("Error fetching request:", error);
    loading.value = false;
  }
};

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const sendEmailNotification = async (email, subject, message) => {
  const templateParams = {
    to_email: email,
    subject: subject,
    message: message,
  };

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_USER_ID
    );
    console.log("Correo enviado correctamente");
  } catch (error) {
    console.error("Error:", error);
  }
};

const approveRequest = async () => {
  if (!request.value) return;

  sending.value = true;
  const auth = getAuth();
  const password = generatePassword();

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      request.value.email,
      password
    );
    const user = userCredential.user;

    const subject = "Bienvenido a Nuestra Plataforma";
    const message = `Hola ${request.value.razonSocial || request.value.nombres},
                     Bienvenido a nuestra plataforma. Su cuenta ha sido creada exitosamente.
                     Email: ${request.value.email}
                     Contraseña: ${password}
                    `;

    await sendEmailNotification(request.value.email, subject, message);

    // Store the new user's data in the 'publishers' collection
    await setDoc(doc(db, "publishers", user.uid), {
      email: request.value.email,
      razonSocial: request.value.razonSocial || request.value.nombres,
      ruc: request.value.ruc,
      direccion: request.value.direccion,
      ciudad: request.value.ciudad,
      departamento: request.value.departamento,
      telefono: request.value.telefono,
      paginaWeb: request.value.paginaWeb,
      createdAt: new Date(),
    });

    await deleteDoc(doc(db, "newPublisherRequest", requestId));
    router.push("/publisher-requests");
  } catch (error) {
    console.error("Error approving request:", error);
  } finally {
    sending.value = false;
  }
};

const rejectRequest = async () => {
  if (!request.value || !observation.value) return;

  sending.value = true;

  try {
    const subject = "Solicitud Rechazada";
    const message = `<p>Hola ${
      request.value.razonSocial || request.value.nombres
    },</p>
                     <p>Lamentamos informarle que su solicitud ha sido rechazada por las siguientes razones:</p>
                     <p>${observation.value}</p>
                     <p>Saludos,<br/>Su Equipo</p>`;

    await sendEmailNotification(request.value.email, subject, message);

    await setDoc(doc(db, "declinedPublisherRequest", requestId), request.value);
    await deleteDoc(doc(db, "newPublisherRequest", requestId));

    router.push("/publisher-requests");
  } catch (error) {
    console.error("Error rejecting request:", error);
  } finally {
    sending.value = false;
  }
};

onMounted(() => {
  fetchRequest();
});
</script>

<style scoped>
.loader {
  border-top-color: #3498db;
  animation: spinner 0.6s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
