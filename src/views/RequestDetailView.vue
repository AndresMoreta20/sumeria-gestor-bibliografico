<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Detalles de la Solicitud" main />
      
      <CardBox class="max-w-4xl mx-auto">
        <div v-if="loading" class="flex items-center justify-center p-4">
          <div class="loader border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></div>
        </div>
        <div v-else-if="submitError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">Error!</strong>
          <span>{{ submitError }}</span>
        </div>
        <div v-else class="space-y-4">
          <!-- Campos de información -->
          <RequestField
            v-for="(value, key) in formFields"
            :key="key"
            :label="fieldLabels[key]"
            :value="value"
            :type="key.includes('description') ? 'textarea' : 'text'"
            @approve="handleApprove(key)"
            @reject="handleReject(key)"
            :approved="fieldStatus[key] === 'approved'"
            :rejected="fieldStatus[key] === 'rejected'"
            :disabled="fieldStatus[key] !== 'pending'"
          />

          <div v-if="form.coverUrl" class="mt-4">
            <label class="block font-bold text-sm mb-1">Portada del libro</label>
            <img :src="form.coverUrl" alt="Portada del libro" class="max-w-full h-40 object-contain" />
          </div>

          <div v-if="form.fileUrl" class="mt-4">
            <label class="block font-bold text-sm mb-1">Archivo del libro</label>
            <a :href="form.fileUrl" download class="text-blue-500 hover:underline">Descargar libro</a>
          </div>

          <BaseDivider class="my-6" />

          <div class="flex justify-end space-x-2">
            <BaseButton
              v-if="allFieldsApproved"
              color="success"
              :icon="mdiCheckCircle"
              @click="approveRequest"
              :disabled="loading"
              label="Aprobar y subir a WooCommerce"
            />
            <BaseButton
              v-if="anyFieldRejected"
              color="danger"
              :icon="mdiCloseCircle"
              @click="rejectRequest"
              :disabled="loading"
              label="Rechazar solicitud"
            />
          </div>
        </div>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiBook, mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import { fetchRequestById, approveRequest as approveRequestFirebase, rejectRequest as rejectRequestFirebase, updateFieldStatus } from '@/api/firebase';
import { uploadProduct, checkSkuExists, fetchCategoryById, fetchCategoryByName, createCategory, fetchPublisherById, fetchAuthorById, fetchLanguageById } from '@/api/woocommerce';
import SectionMain from '@/components/SectionMain.vue';
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
import CardBox from '@/components/CardBox.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseDivider from '@/components/BaseDivider.vue';
import RequestField from '@/components/RequestField.vue';

const route = useRoute();
const router = useRouter();
const requestId = route.params.id;

const form = reactive({});
const fieldStatus = reactive({});

const loading = ref(false);
const submitError = ref(null);

const fieldLabels = {
  title: 'Título',
  format: 'Formato',
  isbn: 'ISBN',
  category: 'Categoría',
  author: 'Autor',
  publisher: 'Editorial',
  language: 'Idioma',
  regularPrice: 'Precio Regular',
  shortDescription: 'Descripción Corta',
  description: 'Descripción Completa',
  coverUrl: 'URL de la portada',
  fileUrl: 'URL del archivo',
};

const formFields = computed(() => {
  return Object.keys(fieldLabels).reduce((acc, key) => {
    acc[key] = form[key];
    return acc;
  }, {});
});

const allFieldsApproved = computed(() => {
  return Object.values(fieldStatus).every(status => status === 'approved');
});

const anyFieldRejected = computed(() => {
  return Object.values(fieldStatus).some(status => status === 'rejected');
});

const fetchFieldById = async (field, id) => {
  if (isNaN(id)) return id;
  try {
    switch (field) {
      case 'category':
        return (await fetchCategoryById(id)).name;
      case 'author':
        return (await fetchAuthorById(id)).name;
      case 'publisher':
        return (await fetchPublisherById(id)).name;
      case 'language':
        return (await fetchLanguageById(id)).name;
      default:
        return id;
    }
  } catch (error) {
    console.error(`Error fetching ${field} by ID (${id}):`, error);
    throw error;
  }
};

const fetchFormData = async () => {
  for (const key of Object.keys(form)) {
    if (['category', 'author', 'publisher', 'language'].includes(key)) {
      form[key] = await fetchFieldById(key, form[key]);
    }
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const data = await fetchRequestById(requestId);
    Object.assign(form, data);
    Object.keys(fieldLabels).forEach(key => {
      fieldStatus[key] = data.fieldStatus?.[key] || 'pending';
    });
    await fetchFormData();
  } catch (error) {
    submitError.value = 'Error fetching request data';
  } finally {
    loading.value = false;
  }
});

const handleApprove = async (field) => {
  try {
    await updateFieldStatus(requestId, field, 'approved', '');
    fieldStatus[field] = 'approved';
  } catch (error) {
    console.error('Error approving field:', error);
    submitError.value = 'Error approving field';
  }
};

const handleReject = async (field) => {
  const comment = prompt('Por favor, ingrese una razón para el rechazo:');
  if (comment !== null) {
    try {
      await updateFieldStatus(requestId, field, 'rejected', comment);
      fieldStatus[field] = 'rejected';
    } catch (error) {
      console.error('Error rejecting field:', error);
      submitError.value = 'Error rejecting field';
    }
  }
};

const generateUniqueSku = async (baseSku) => {
  let sku = baseSku;
  let suffix = 1;
  while (await checkSkuExists(sku)) {
    sku = `${baseSku}-${suffix}`;
    suffix += 1;
  }
  return sku;
};

const getCategoryId = async (categoryName) => {
  try {
    let category = await fetchCategoryByName(categoryName);
    if (!category) {
      category = await createCategory(categoryName);
    }
    return category.id;
  } catch (error) {
    console.error('Error getting or creating category:', error);
    throw error;
  }
};

const approveRequest = async () => {
  if (!allFieldsApproved.value) {
    submitError.value = 'Por favor, apruebe todos los campos antes de subir a WooCommerce';
    return;
  }

  loading.value = true;
  submitError.value = null;

  try {
    const baseSku = form.isbn || `SKU${Date.now()}`;
    const uniqueSku = await generateUniqueSku(baseSku);

    // Convertir categorías a IDs
    const categoryNames = form.category.split(',');
    const categories = await Promise.all(categoryNames.map(name => getCategoryId(name.trim())));

    const data = {
      name: form.title,
      type: 'simple',
      regular_price: String(form.regularPrice || '0'),
      description: form.description,
      short_description: form.shortDescription,
      categories: categories.map(id => ({ id })),
      images: form.coverUrl ? [{ src: form.coverUrl }] : [],
      attributes: [
        { id: 1, name: 'Autor', position: 0, visible: true, variation: false, options: [form.author] },
        { id: 3, name: 'ISBN', position: 1, visible: true, variation: false, options: [form.isbn] },
        { id: 4, name: 'Editorial', position: 2, visible: true, variation: false, options: [form.publisher] },
        { id: 2, name: 'Formato', position: 3, visible: true, variation: false, options: [form.format] },
        { id: 7, name: 'Idioma', position: 4, visible: true, variation: false, options: [form.language] },
        { id: 6, name: 'Encuadernación', position: 5, visible: true, variation: false, options: ['Tapa blanda'] },
        { id: 5, name: 'Estado', position: 6, visible: true, variation: false, options: ['Nuevo'] }
      ],
      manage_stock: true,
      stock_quantity: 100,
      sku: uniqueSku,
    };

    if (form.format.toLowerCase() === 'e-book') {
      data.virtual = true;
      data.downloadable = true;
      data.downloads = [
        { name: 'Digital Book', file: form.fileUrl }
      ];
    } else {
      data.virtual = false;
      data.downloadable = false;
    }

    console.log('Sending data to WooCommerce:', JSON.stringify(data, null, 2));

    const response = await uploadProduct(data);

    console.log('Book uploaded successfully:', response);

    await approveRequestFirebase({...form, id: requestId});
    router.push('/requestsAdmin');
  } catch (error) {
    console.error('Error approving request:', error);
    submitError.value = 'Error uploading to WooCommerce: ' + (error.response?.data?.message || error.message);
  } finally {
    loading.value = false;
  }
};

const rejectRequest = async () => {
  loading.value = true;
  submitError.value = null;

  try {
    const comment = prompt('Por favor, ingrese una razón para el rechazo:');
    if (comment !== null && comment.trim() !== '') {
      await rejectRequestFirebase(requestId, comment);
      router.push('/requestsAdmin');
    } else {
      submitError.value = 'Rechazo cancelado: No se proporcionó un comentario.';
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    submitError.value = 'Error rejecting request';
  } finally {
    loading.value = false;
  }
};
</script>
