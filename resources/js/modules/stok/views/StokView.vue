<template>
  <div class="content container-fluid">
    <div class="page-header">
      <div class="add-item d-flex">
        <div class="page-title">
          <h4>Halaman Stok Produk</h4>
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
        <StokList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStok } from '../composables/useStok'
import PeriodeList from '../components/PeriodeList.vue';
import StokList from '../components/StokList.vue';

const { handleRefresh } = useStok();
</script>
