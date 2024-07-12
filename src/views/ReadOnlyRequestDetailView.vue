<template>
    <LayoutAuthenticated>
      <SectionMain>
        <SectionTitleLineWithButton :icon="mdiBook" title="Para leer Solicitud" main />
        
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
              :disabled="true"
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
          </div>
        </CardBox>
      </SectionMain>
    </LayoutAuthenticated>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { mdiBook } from '@mdi/js';
  import { fetchRequestById } from '@/api/firebase';
  import { fetchCategoryById, fetchAuthorById, fetchLanguageById, fetchPublisherById } from '@/api/woocommerce';
  import SectionMain from '@/components/SectionMain.vue';
  import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue';
  import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';
  import CardBox from '@/components/CardBox.vue';
  import BaseDivider from '@/components/BaseDivider.vue';
  import RequestField from '@/components/RequestField.vue';
  
  const route = useRoute();
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
  </script>
  