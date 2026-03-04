<template>
  <div class="content container-fluid">
    <div class="page-header">
      <div class="add-item d-flex">
        <div class="page-title">
          <h4>Halaman Stok Nampan Produk</h4>
          <h6>Kelola Stok Anda</h6>
        </div>
      </div>
      <ul class="table-top-head">
        <li>
          <a data-bs-toggle="tooltip" title="Refresh" @click="handleRefresh">
            <i data-feather="rotate-ccw"></i>
          </a>
        </li>
      </ul>
    </div>

    <div class="row align-items-start">
      <div class="col-lg-4 col-xl-3">
        <PeriodeList />
      </div>

      <div class="col-lg-8 col-xl-9">
        <ProdukList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStock } from '../composables/useStock'
import PeriodeList from '../components/PeriodeList.vue';
import ProdukList from '../components/ProdukList.vue';

const { handleRefresh } = useStock();
</script>
