<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { mdiBook } from "@mdi/js";
import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import CardBox from "@/components/CardBox.vue";
import TableBooks from "@/components/TableBooks.vue";
import BookDetail from "@/components/BookDetail.vue";

const consumerKey = import.meta.env.VITE_APP_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_APP_CONSUMER_SECRET;

const books = ref([]);
const selectedBookId = ref(null); // Nuevo estado para el ID del libro seleccionado

const fetchBooks = async () => {
  try {
    const response = await axios.get(
      "https://cindyl23.sg-host.com/wp-json/wc/v3/products?per_page=100",
      {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      }
    );
    books.value = response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

// Mostrar el detalle del libro
const viewBook = (bookId) => {
  selectedBookId.value = bookId;
};

// Cerrar la vista de detalle del libro y regresar a la tabla
const closeDetailView = () => {
  selectedBookId.value = null;
};

onMounted(fetchBooks);
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBook" title="Libros" main>
        <!-- Optional button can go here -->
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <template v-if="selectedBookId">
          <BookDetail :book-id="selectedBookId" @close="closeDetailView" />
        </template>
        <template v-else>
          <TableBooks :books="books" @view-book="viewBook" />
        </template>
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
