<script setup>
import { computed, ref, onMounted } from "vue";
import {
  mdiBookOpenPageVariant,
  mdiCheck,
  mdiClose,
  mdiReload,
  mdiChartPie,
  mdiCartOutline,
  mdiAccountMultiple,
  mdiCurrencyUsd,
} from "@mdi/js";
import * as chartConfig from "@/components/Charts/chart.config.js";
import LineChart from "@/components/Charts/LineChart.vue";
import SectionMain from "@/components/SectionMain.vue";
import CardBoxWidget from "@/components/CardBoxWidget.vue";
import CardBox from "@/components/CardBox.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import SectionTitleLineWithButton from "@/components/SectionTitleLineWithButton.vue";
import { fetchSalesData, fetchCustomersData, fetchBooks } from "@/api/woocommerce";

const chartDataSales = ref(null);
const chartDataCustomers = ref(null);
const totalSales = ref(0);
const totalOrders = ref(0);
const totalCustomers = ref(0);
const averageOrderValue = ref(0);

const fillChartData = async () => {
  try {
    const salesData = await fetchSalesData();
    const customersData = await fetchCustomersData();

    // Generar datos para los gráficos
    chartDataSales.value = chartConfig.generateChartData(
      salesData,
      'Ventas totales',
      'total_sales'
    );
    chartDataCustomers.value = chartConfig.generateChartData(
      salesData,
      'Número de pedidos',
      'orders_count'
    );

    // Calcular métricas relevantes
    totalSales.value = salesData.reduce((total, item) => total + parseFloat(item.total_sales), 0).toFixed(2);
    totalOrders.value = salesData.reduce((total, item) => total + parseInt(item.orders_count), 0);
    totalCustomers.value = customersData.length;
    averageOrderValue.value = (totalSales.value / totalOrders.value).toFixed(2);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fillChartData();
});
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <!-- Power BI Iframe -->
      <!-- Power BI Iframe -->
      <iframe
        title="DashboardSumeria"
        width="100%"
        height="3500px"
        src="https://app.powerbi.com/view?r=eyJrIjoiNWVjYjU2MmMtODQzZC00Nzc4LTkzMTctMWRlMDJlOWNkYWRlIiwidCI6IjU4NWE0ZDkyLWRiMWQtNGJiYi1iNWFjLWM1Mjk5ZTM4OTRlMyIsImMiOjR9"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
      <!-- <div class="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
        <CardBoxWidget
          color="text-green-500"
          :icon="mdiCurrencyUsd"
          :number="totalSales"
          label="Total de Ventas ($)"
        />
        <CardBoxWidget
          color="text-blue-500"
          :icon="mdiCartOutline"
          :number="totalOrders"
          label="Total de Pedidos"
        />
        <CardBoxWidget
          color="text-red-500"
          :icon="mdiAccountMultiple"
          :number="totalCustomers"
          label="Total de Clientes"
        />
        <CardBoxWidget
          color="text-yellow-500"
          :icon="mdiCurrencyUsd"
          :number="averageOrderValue"
          label="Valor Promedio de Pedido ($)"
        />
      </div>

      <SectionTitleLineWithButton :icon="mdiChartPie" title="Análisis de Ventas">
        <BaseButton :icon="mdiReload" color="whiteDark" @click="fillChartData" />
      </SectionTitleLineWithButton>

      <CardBox class="mb-6">
        <div v-if="chartDataSales">
          <LineChart :data="chartDataSales" class="h-96" />
        </div>
      </CardBox>

      <CardBox class="mb-6">
        <div v-if="chartDataCustomers">
          <LineChart :data="chartDataCustomers" class="h-96" />
        </div> -->
      <!-- </CardBox> -->
    </SectionMain>
  </LayoutAuthenticated>
</template>