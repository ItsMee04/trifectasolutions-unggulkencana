<template>
  <div class="card">
    <div class="card-body">
      <div v-if="isLoadingChart" class="d-flex align-items-center justify-content-center" style="height: 350px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Sinkronisasi Grafik...</p>
        </div>
      </div>

      <div v-else style="position: relative; height: 350px; width: 100%;">
        <Line
          v-if="chartLabels.length > 0"
          :data="formattedData"
          :options="chartOptions"
          :key="chartKey"
        />

        <div v-else class="d-flex align-items-center justify-content-center h-100">
          <p class="text-muted">Data grafik 14 hari terakhir tidak ditemukan.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { useHome } from '../composables/useDashboard'; // Pastikan path benar
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { chartLabels, chartSales, chartPurchases, isLoadingChart, fetchChartData } = useHome();

onMounted(() => {
  fetchChartData();
});

// Penting: Memaksa re-render jika jumlah label berubah
const chartKey = computed(() => JSON.stringify(chartLabels.value));

const formattedData = computed(() => {
  return {
    labels: chartLabels.value,
    datasets: [
      {
        label: 'Penjualan',
        data: chartSales.value,
        borderColor: '#28C76F',
        backgroundColor: 'rgba(40, 199, 111, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Pembelian',
        data: chartPurchases.value,
        borderColor: '#EA5455',
        backgroundColor: 'rgba(234, 84, 85, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' }
  },
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
