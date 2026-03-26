<template>
  <div class="card flex-fill">
    <div class="card-header">
      <h5 class="card-title mb-0">Statistik 14 Hari Terakhir</h5>
    </div>
    <div class="card-body">
      <div v-if="isLoadingChart" class="d-flex align-items-center justify-content-center" style="height: 300px;">
        <p class="text-muted">Memuat data grafik...</p>
      </div>
      <div v-else style="position: relative; height: 300px; width: 100%;">
        <Line
          v-if="chartLabels.length > 0"
          :data="formattedData"
          :options="chartOptions"
          :key="chartKey"
        />
        <div v-else class="d-flex align-items-center justify-content-center h-100">
          <p class="text-muted">Data tidak tersedia</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { useHome } from '../composables/useDashboard';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { chartLabels, chartSales, chartPurchases, isLoadingChart, fetchChartData } = useHome();

onMounted(() => {
    fetchChartData();
});

const chartKey = computed(() => JSON.stringify(chartLabels.value));

const formattedData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Penjualan',
      data: chartSales.value,
      borderColor: '#28C76F',
      backgroundColor: 'rgba(40, 199, 111, 0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Pembelian',
      data: chartPurchases.value,
      borderColor: '#EA5455',
      backgroundColor: 'rgba(234, 84, 85, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => 'Rp ' + value.toLocaleString('id-ID')
      }
    }
  }
};
</script>
