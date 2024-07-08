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
              @edit="handleEdit(key)"
              @reject="handleReject(key)"
              :disabled="fieldStatus[key] === 'approved'"
              :approved="fieldStatus[key] === 'approved'"
            />
  
            <BaseDivider class="my-6" />
  
            <div class="flex justify-end space-x-2">
              <BaseButton
                color="success"
                :icon="mdiCheckCircle"
                @click="approveRequest"
                :disabled="loading || !allFieldsApproved"
                label="Aprobar y subir a WooCommerce"
              />
              <BaseButton
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
  import { uploadProduct, checkSkuExists, fetchCategoryByName, createCategory } from '@/api/woocommerce';
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
    salePrice: 'Precio de Oferta',
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
  
  onMounted(async () => {
    loading.value = true;
    try {
      const data = await fetchRequestById(requestId);
      Object.assign(form, data);
      Object.keys(fieldLabels).forEach(key => {
        fieldStatus[key] = data.fieldStatus?.[key] || 'pending';
      });
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
  
  const handleEdit = (field) => {
    fieldStatus[field] = 'pending';
  };
  
  const handleReject = async (field) => {
    const comment = prompt('Please enter a reason for rejection:');
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
  
      const categoryId = await getCategoryId(form.category);
  
      const data = {
        name: form.title,
        type: 'simple',
        regular_price: String(form.regularPrice || '0'),
        sale_price: form.salePrice ? String(form.salePrice) : '',
        description: form.description,
        short_description: form.shortDescription,
        categories: [{ id: categoryId }],
        images: form.coverUrl ? [{ src: form.coverUrl }] : [],
        attributes: [
          { id: 1, name: 'Autor', options: [form.author], visible: true, variation: false },
          { id: 3, name: 'ISBN', options: [form.isbn], visible: true, variation: false },
          { id: 4, name: 'Editorial', options: [form.publisher], visible: true, variation: false },
          { id: 2, name: 'Formato', options: [form.format], visible: true, variation: false },
          { id: 7, name: 'Idioma', options: [form.language], visible: true, variation: false },
          { id: 6, name: 'Encuadernación', options: ['Tapa blanda'], visible: true, variation: false },
          { id: 5, name: 'Estado', options: ['Nuevo'], visible: true, variation: false }
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
  
      if (!data.sale_price) {
        delete data.sale_price;
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
      await rejectRequestFirebase({...form, id: requestId});
      router.push('/requestsAdmin');
    } catch (error) {
      console.error('Error rejecting request:', error);
      submitError.value = 'Error rejecting request';
    } finally {
      loading.value = false;
    }
  };
  </script>