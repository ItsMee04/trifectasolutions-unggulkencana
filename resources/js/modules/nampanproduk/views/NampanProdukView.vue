<template>
  <div class="content container-fluid">
    <div class="page-header">
      <div class="add-item d-flex">
        <div class="page-title">
          <h4>Halaman Nampan Produk</h4>
          <h6>Kelola Nampan Produk Anda</h6>
        </div>
      </div>
      <ul class="table-top-head">
        <li>
          <a data-bs-toggle="tooltip" title="Refresh">
            <i data-feather="rotate-ccw"></i>
          </a>
        </li>
      </ul>
      <div class="page-btn import">
        <a href="#" class="btn btn-added color">
          <i data-feather="plus-circle" class="me-2"></i>Tambah Produk
        </a>
      </div>
    </div>

    <div class="row align-items-start">
      <div class="col-lg-4 col-xl-3">
        <NampanList />
      </div>

      <div class="col-lg-8 col-xl-9">
        <NampanProdukTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
// import { useNampanProduk } from '../composables/useNampanProduk'
import NampanList from '../components/NampanList.vue';
import NampanProdukTable from '../components/NampanProdukTable.vue';

// onMounted(() => {
//     fetchNampan();
// });
</script>
