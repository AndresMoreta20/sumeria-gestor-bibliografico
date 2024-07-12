<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton
        :icon="mdiBookOutline"
        title="Crear Nueva Solicitud de Libro"
        main
      />
      <CardBox form @submit.prevent="submit" class="max-w-3xl mx-auto">
        <div
          v-if="submitError"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline">{{ submitError }}</span>
        </div>
        <div
          v-if="formattedComments"
          class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong class="font-bold">Comentarios del Administrador: </strong>
          <span class="block sm:inline" v-html="formattedComments"></span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Imagen de Portada" :error="errors.imageFile">
            <FormFilePicker
              v-model="form.imageFile"
              @update:modelValue="handleImageChange"
              accept="image/*"
            />
            <div v-if="imagePreview" class="flex justify-center mt-2">
              <img
                :src="imagePreview"
                alt="Vista previa de portada"
                class="max-w-full h-40 object-contain"
              />
            </div>
            <p v-if="imageLoading" class="mt-1 text-sm text-blue-600">
              Subiendo imagen...
            </p>
          </FormField>
          <FormField label="Archivo EPUB" :error="errors.file">
            <FormFilePicker
              v-model="form.file"
              @update:modelValue="handleFileChange"
              accept=".epub"
            />
            <p v-if="fileLoading" class="mt-1 text-sm text-blue-600">
              Subiendo archivo...
            </p>
          </FormField>
        </div>
        <BaseDivider />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Título" :error="errors.title">
            <FormControl
              v-model="form.title"
              type="text"
              placeholder="Título del libro"
            />
          </FormField>
          <FormField label="ISBN" :error="errors.isbn">
            <FormControl v-model="form.isbn" type="text" placeholder="ISBN" />
          </FormField>
          <FormField label="Categoría">
            <select
              v-model="form.category"
              @change="(e) => handleSelectionChange(e, 'category')"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Selecciona una categoría</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
              <option value="new">Añadir nueva categoría</option>
            </select>
            <div v-if="showNewInput.category" class="mt-2">
              <FormControl
                v-model="newEntry.category"
                type="text"
                placeholder="Nueva categoría"
                @keyup.enter="() => addNewEntry('category')"
              />
              <BaseButton
                class="mt-2"
                color="info"
                label="Añadir"
                @click="() => addNewEntry('category')"
              />
            </div>
          </FormField>
          <FormField label="Autor" :error="errors.author">
            <select
              v-model="form.author"
              @change="(e) => handleSelectionChange(e, 'author')"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Selecciona un autor</option>
              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.id"
              >
                {{ author.name }}
              </option>
              <option value="new">Añadir nuevo autor</option>
            </select>
            <div v-if="showNewInput.author" class="mt-2">
              <FormControl
                v-model="newEntry.author"
                type="text"
                placeholder="Nuevo autor"
                @keyup.enter="() => addNewEntry('author')"
              />
              <BaseButton
                class="mt-2"
                color="info"
                label="Añadir"
                @click="() => addNewEntry('author')"
              />
            </div>
          </FormField>
          <FormField label="Editorial" :error="errors.publisher">
            <FormControl
              v-model="form.publisher"
              type="text"
              placeholder="Nombre de la editorial"
              disabled
            />
          </FormField>
          <FormField label="Idioma" :error="errors.language">
            <select
              v-model="form.language"
              @change="(e) => handleSelectionChange(e, 'language')"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Selecciona un idioma</option>
              <option
                v-for="language in languages"
                :key="language.id"
                :value="language.id"
              >
                {{ language.name }}
              </option>
              <option value="new">Añadir nuevo idioma</option>
            </select>
            <div v-if="showNewInput.language" class="mt-2">
              <FormControl
                v-model="newEntry.language"
                type="text"
                placeholder="Nuevo idioma"
                @keyup.enter="() => addNewEntry('language')"
              />
              <BaseButton
                class="mt-2"
                color="info"
                label="Añadir"
                @click="() => addNewEntry('language')"
              />
            </div>
          </FormField>
          <FormField label="Precio Regular ($)" :error="errors.regularPrice">
            <FormControl
              v-model.number="form.regularPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="Precio regular"
            />
          </FormField>
        </div>
        <FormField label="Descripción Corta" :error="errors.shortDescription">
          <FormControl
            v-model="form.shortDescription"
            type="textarea"
            placeholder="Breve descripción del libro"
          />
        </FormField>
        <FormField label="Descripción Completa">
          <FormControl
            v-model="form.description"
            type="textarea"
            placeholder="Descripción completa del libro"
          />
        </FormField>
        <template #footer>
          <BaseButtons>
            <BaseButton
              v-if="!loading"
              type="submit"
              color="info"
              label="Enviar Solicitud"
              @click="submit"
            />
            <BaseButton
              v-if="loading"
              color="info"
              label="Enviando..."
              disabled
            />
            <BaseButton
              @click="cancel"
              color="danger"
              label="Cancelar"
              outline
            />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from "vue";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import SectionMain from "@/components/SectionMain.vue";
import CardBox from "@/components/CardBox.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import FormFilePicker from "@/components/FormFilePicker.vue";
import BaseDivider from "@/components/BaseDivider.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import { useRoute, useRouter } from "vue-router";
import { mdiBookOutline } from "@mdi/js";
import {
  fetchCategories,
  fetchAuthors,
  fetchLanguages,
} from "@/api/woocommerce";

const route = useRoute();
const router = useRouter();

const categories = ref([]);
const authors = ref([]);
const languages = ref([]);
const newEntry = ref({ category: "", author: "", language: "" });
const showNewInput = reactive({
  category: false,
  author: false,
  language: false,
});
const appealMode = ref(false);
const requestId = ref(null);

const loadRequestData = async (id) => {
  try {
    const db = getFirestore();
    const requestDoc = await getDoc(doc(db, "declinedBooks", id));
    if (requestDoc.exists()) {
      const data = requestDoc.data();
      Object.assign(form, data);
      form.comments = data.comments;
      form.imageFile = null;
      form.file = null;
      imagePreview.value = data.coverUrl;
    } else {
      throw new Error("Request not found");
    }
  } catch (error) {
    console.error("Error loading request data:", error);
  }
};

const formatComments = (comments) => {
  return Object.entries(comments)
    .map(([field, comment]) => {
      return `<strong>${field}:</strong> ${comment}`;
    })
    .join("<br>");
};

onMounted(async () => {
  try {
    const categoriesResponse = await fetchCategories();
    categories.value = categoriesResponse.data;

    const authorsResponse = await fetchAuthors();
    authors.value = authorsResponse.data;

    const languagesResponse = await fetchLanguages();
    languages.value = languagesResponse.data;

    form.publisher = sessionStorage.getItem("user-name") || "";

    const { appeal, id } = route.query;
    if (appeal && id) {
      appealMode.value = true;
      requestId.value = id;
      await loadRequestData(id);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

const handleSelectionChange = (event, type) => {
  if (event.target.value === "new") {
    showNewInput[type] = true;
    form[type] = "";
    errors[type] = ""; // Limpiar el mensaje de error cuando se selecciona "Añadir nuevo"
  } else {
    showNewInput[type] = false;
    form[type] = event.target.value;
  }
};

const addNewEntry = (type) => {
  if (newEntry.value[type].trim() !== "") {
    form[type] = newEntry.value[type].trim();
    if (type === "category") {
      categories.value.push({ id: form[type], name: form[type] });
    } else if (type === "author") {
      authors.value.push({ id: form[type], name: form[type] });
    } else if (type === "language") {
      languages.value.push({ id: form[type], name: form[type] });
    }
    showNewInput[type] = false;
    newEntry.value[type] = "";
  }
};

const form = reactive({
  title: "",
  format: "E-book",
  file: null,
  isbn: "",
  category: "",
  author: "",
  publisher: "",
  language: "",
  regularPrice: "",
  shortDescription: "",
  description: "",
  imageFile: null,
  stockQuantity: 100,
  sku: "",
  comments: {},
});

const formattedComments = computed(() => formatComments(form.comments));

const loading = ref(false);
const imageLoading = ref(false);
const fileLoading = ref(false);
const errors = reactive({});
const imagePreview = ref(null);
const submitError = ref(null);

const generateSKU = () => {
  const date = new Date();
  const timestamp = date.getTime();
  return `SKU${timestamp}`;
};

const validateISBN = (isbn) => {
  isbn = isbn.replace(/[-\s]/g, "");
  if (isbn.length !== 10 && isbn.length !== 13) return false;

  let sum = 0;
  if (isbn.length === 10) {
    for (let i = 0; i < 9; i++) {
      sum += (10 - i) * parseInt(isbn.charAt(i));
    }
    let checksum = 11 - (sum % 11);
    if (checksum === 11) checksum = 0;
    if (checksum === 10) checksum = "X";
    return checksum.toString() === isbn.charAt(9).toUpperCase();
  } else {
    for (let i = 0; i < 12; i++) {
      sum += (i % 2 === 0 ? 1 : 3) * parseInt(isbn.charAt(i));
    }
    let checksum = 10 - (sum % 10);
    if (checksum === 10) checksum = 0;
    return checksum.toString() === isbn.charAt(12);
  }
};

const validateField = (field) => {
  switch (field) {
    case "title":
      errors[field] = !form[field] ? "El título es requerido" : "";
      break;
    case "isbn":
      errors[field] = !form[field]
        ? "El ISBN es requerido"
        : !validateISBN(form[field])
        ? "El ISBN no es válido"
        : "";
      break;
    case "author":
      errors[field] =
        !form[field] && !showNewInput.author ? "El autor es requerido" : "";
      break;
    case "publisher":
      errors[field] = !form[field] ? "La editorial es requerida" : "";
      break;
    case "language":
      errors[field] =
        !form[field] && !showNewInput.language ? "El idioma es requerido" : "";
      break;
    case "regularPrice":
      errors[field] =
        !form[field] || isNaN(form[field]) || form[field] < 0
          ? "Se requiere un precio regular válido y no negativo"
          : "";
      break;
    case "shortDescription":
      errors[field] = !form[field] ? "La descripción corta es requerida" : "";
      break;
    case "imageFile":
      errors[field] = !form[field] ? "La imagen de portada es requerida" : "";
      break;
    case "file":
      errors[field] = !form[field]
        ? "El archivo EPUB es requerido"
        : form[field] && !form[field].name.endsWith(".epub")
        ? "El archivo debe estar en formato EPUB"
        : "";
      break;
  }
};

Object.keys(form).forEach((field) => {
  watch(
    () => form[field],
    () => validateField(field)
  );
});

const validateForm = () => {
  Object.keys(form).forEach(validateField);
  return Object.values(errors).every((error) => error === "");
};

const uploadFile = async (file, path) => {
  const storage = getStorage();
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

const handleImageChange = (file) => {
  form.imageFile = file;
  errors.imageFile = "";
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleFileChange = (file) => {
  if (file.name.endsWith(".epub")) {
    form.file = file;
    errors.file = "";
  } else {
    errors.file = "El archivo debe estar en formato EPUB";
    form.file = null;
  }
};

const submit = async () => {
  submitError.value = null;

  if (!validateForm()) {
    return;
  }

  loading.value = true;
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      submitError.value = "Debes estar conectado para enviar una solicitud";
      return;
    }

    const sku = generateSKU();

    imageLoading.value = true;
    const coverUrl = await uploadFile(
      form.imageFile,
      `covers/${sku}_${form.imageFile.name}`
    );
    imageLoading.value = false;

    fileLoading.value = true;
    const fileUrl = await uploadFile(
      form.file,
      `books/${sku}_${form.file.name}`
    );
    fileLoading.value = false;

    const requestData = {
      title: form.title,
      format: form.format,
      isbn: form.isbn,
      category: form.category,
      author: form.author,
      publisher: form.publisher,
      language: form.language,
      regularPrice: parseFloat(form.regularPrice),
      shortDescription: form.shortDescription,
      description: form.description,
      coverUrl,
      fileUrl,
      stockQuantity: form.stockQuantity,
      sku,
      status: "pending",
      userEmail: user.email,
      createdAt: new Date(),
    };

    const db = getFirestore();
    const requestRef = collection(db, "bookRequests");
    await addDoc(requestRef, requestData);

    alert("Solicitud enviada con éxito");
    router.push("/requests");
  } catch (error) {
    submitError.value = "Error al crear la solicitud: " + error.message;
  } finally {
    loading.value = false;
    imageLoading.value = false;
    fileLoading.value = false;
  }
};

const cancel = () => {
  router.push("/requests");
};
</script>
